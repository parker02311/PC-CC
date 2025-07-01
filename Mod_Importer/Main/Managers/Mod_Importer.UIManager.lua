local global = _G
---@diagnostic disable-next-line: undefined-field
local api = global.api ---@type Api
local pairs = global.pairs
local ipairs = global.ipairs
local require = global.require
local module = global.module
local loadfile = global.loadfile
local tostring = global.tostring
local type = global.type
local math = global.math
local coroutine = global.coroutine

local Vector3 = require("Vector3") ---@type Vector3
local table = require("Common.tableplus")
local Mutators = require("Environment.ModuleMutators")

local ImporterUI = require("UI.Mod_Importer") ---@type ImporterUI
local utils = require("Utils.Mod_Importer") ---@type Mod_ImporterUtils

---@class ImporterUIManager
---@field ui ImporterUI
---@field WorldAPIs WorldAPIs
---@field RidesAPI WorldAPIs_rides
---@field EditorsAPI WorldAPIs_editors
---@field TrackedRideDatabase WorldAPIs_trackedridedatabase
---@field previewToken string|nil
---@field coroutine thread
local ImporterUIManager = module(..., Mutators.Manager())

ImporterUIManager.Init = function(self, _tProperties, _tEnvironment)
	api.debug.Trace("ImporterUIManager:Init()")
	self.WorldAPIs = api.world:GetWorldAPIs()
	self.RidesAPI = self.WorldAPIs.rides
	self.EditorsAPI = self.WorldAPIs.editors
	self.TrackedRideDatabase = self.WorldAPIs.trackedridedatabase

	self.ui = ImporterUI:new(function()
		api.debug.Trace("Mod_Importer.ImporterManager:ImporterUI is ready")
		if self.ui then
			self.ui:AddListener_ImporterImport(function()
				self.coroutine = coroutine.create(function()
					self:ImportCoaster()
				end)
			end, self)
		end
	end)
end

---@return any
ImporterUIManager.GetTrackHolder = function(self) end
ImporterUIManager.CreateSelection = function(self, data) end
ImporterUIManager.GetSelection = function(self) end

ImporterUIManager.Advance = function(self)
	if self.coroutine and coroutine.status(self.coroutine) == "suspended" then
		api.debug.Trace("Resuming coroutine")
		coroutine.resume(self.coroutine)
	end
end

ImporterUIManager.ImportCoaster = function(self)
	api.debug.Trace("ImporterUIManager:ImportCoaster()")
	if self.previewToken then
		self:TryCommit(self.previewToken)
		return
	end

	local file = loadfile("Win64/ovldata/Mod_Importer/coaster.lua")
	if not file then
		api.debug.Error("Failed to load coaster.lua")
		self:MakeErrorPopup({
			bTrackNotLegal = true,
		}, {
			bTrackNotLegal = "[STRING_LITERAL:Value=|Failed to load coaster data file. Please ensure coaster.lua exists in the correct directory.|]",
		})
		return
	end
	local coasterData = file()
	if not coasterData then
		api.debug.Error("coaster.lua did not return valid data")
		self:MakeErrorPopup({
			bTrackNotLegal = true,
		}, {
			bTrackNotLegal = "[STRING_LITERAL:Value=|Coaster data is invalid. Please check the coaster.lua file.|]",
		})
		return
	end

	for i, v in ipairs(coasterData) do
		if not v.pos or not v.rot or not v.twist then
			api.debug.Error("Invalid coaster data at index " .. i)
			return
		end

		coasterData[i].pos = Vector3:new(v.pos[1], v.pos[2], v.pos[3])
		coasterData[i].rot = Vector3:new(v.rot[1], v.rot[2], v.rot[3])
	end

	local trackHolder = self:GetTrackHolder()
	api.debug.Trace("Track Holder Got")

	local rideType = api.track.GetRideType(trackHolder)
	api.debug.Trace("Ride Type: " .. tostring(rideType))
	local tTrackResData = self.TrackedRideDatabase:BuildTrackResData(rideType)
	api.debug.Trace("Track Res Data: " .. table.tostring(tTrackResData))

	api.debug.Trace("Getting free point for ride")
	local selection = self:_GetFreePointWithOutDirection(trackHolder)
	if selection == nil then
		api.debug.Error("No free point found")
		self:MakeErrorPopup({
			bTrackNotLegal = true,
		}, {
			bTrackNotLegal = "[STRING_LITERAL:Value=|No free point found on track holder.|]",
		})
		return
	end

	local section = selection:GetSection(1)
	local sElementName = api.track.GetElementName(section)
	local tTrackParams = api.track.GetTrackParams(section)
	api.debug.Trace("Track Params: " .. table.tostring(tTrackParams))

	local tSelections = {}
	api.debug.Trace("Getting Join Point")
	local vstartT = selection:GetJoinPoint(1, false)

	api.debug.Trace("looping coasterData")
	self:CreateSelection({
		coasterData = coasterData,
		vstartT = vstartT,
		sElementName = sElementName,
		tTrackParams = tTrackParams,
		tTrackResData = tTrackResData,
		tSelections = tSelections,
	})
	while self:GetSelection() == nil do
		coroutine.yield()
	end

	api.debug.Trace("Calling beginpreview")
	api.debug.Trace(table.tostring(tSelections))

	self.previewToken = self:BeginPreview(function(changelist)
		for _, segment in ipairs(tSelections) do
			api.debug.Trace("AddSelection " .. table.tostring(segment))
			api.track.AddSelection(changelist, segment, api.track.PreviewAdd, false, false, true)
		end
	end)
end

--- Gets a free point on the track holder that is a valid out point.
--- This function iterates through the free ends of the track holder and returns the first one that
--- is in the out direction (or both).
--- @param self ImporterUIManager
--- @param trackHolder table
--- @return unknown|nil
ImporterUIManager._GetFreePointWithOutDirection = function(self, trackHolder)
	if trackHolder == nil then
		api.debug.Error("trackHolder is nil")
		self:MakeErrorPopup({
			bTrackNotLegal = true,
		}, {
			bTrackNotLegal = "[STRING_LITERAL:Value=|Track holder is nil.|]",
		})
		return
	end
	local tFreeEnds = api.track.GetFreeEnds(trackHolder)
	api.debug.Trace("Free Ends: " .. table.tostring(tFreeEnds))

	local best = nil
	local bestZ = nil

	for _, selec in ipairs(tFreeEnds) do
		local FindJoinDirection = api.track.FindJoinDirection(selec)
		api.debug.Trace(tostring(FindJoinDirection))
		if FindJoinDirection == api.track.TrackDirection_Out or FindJoinDirection == api.track.TrackDirection_Both then
			local joinPoint = selec:GetJoinPoint(1, false)
			if joinPoint then
				---@type Vector3
				local pos = joinPoint:GetPos()
				if pos then
					local z = pos:GetZ()
					api.debug.Trace("Join point Z position: " .. tostring(z))
					if best == nil or z > bestZ then
						best = selec
						bestZ = z
						api.debug.Trace("New best selection with Z: " .. tostring(bestZ))
					end
				end
			end
		end
	end
	return best
end

--- Tries to commit the preview token.
--- If it cannot commit, it will show a failure popup with the reasons why it cannot commit.
---@param self ImporterUIManager
---@param previewToken string
ImporterUIManager.TryCommit = function(self, previewToken)
	local canCommit = api.undo.CanCommitPreview(previewToken)
	if canCommit then
		api.debug.Trace("Wait for commit to finish")
		self:WaitFor(api.undo.CommitPreview(previewToken))
	else
		api.debug.Trace("Can't commit")
		local whyNot = api.undo.GetCommitFailReasons(previewToken)
		api.debug.Trace("Reason: " .. tostring(whyNot))
		api.debug.Trace("Reason: " .. table.tostring(whyNot))
		self:MakeErrorPopup(whyNot)
	end
end

--- Begins a preview of the changes to be made.
--- This function creates an undo operations hierarchy and adds operations to it.
--- @param self ImporterUIManager
--- @param _fnAddOperations function A function that takes a changeListHierarchy and adds operations
ImporterUIManager.BeginPreview = function(self, _fnAddOperations)
	api.debug.Trace("BeginPreview")
	local changeListHierarchy = self.EditorsAPI:CreateUndoOperationsHierarchy()

	_fnAddOperations(changeListHierarchy)

	local changelist = changeListHierarchy:GetFullUndoChangeList()

	local waitToken, previewToken = api.undo.PreviewChangeList(changelist)
	self:WaitFor(waitToken)
	api.debug.Trace("BeginPreview end")
	return previewToken
end

--- Waits for a undo operation to complete.
--- @param self ImporterUIManager
--- @param token string The token of the undo to wait for
ImporterUIManager.WaitFor = function(self, token)
	while token and not api.undo.IsOperationComplete(token) do
		coroutine.yield()
	end
end

--- Creates an error popup with the reasons why the import failed.
--- @param self ImporterUIManager
--- @param _tReasons table A table of reasons why the import failed
--- @param _tFailureMessagesOverrides table|nil A table of failure messages overrides
ImporterUIManager.MakeErrorPopup = function(self, _tReasons, _tFailureMessagesOverrides)
	api.debug.Trace("MakeErrorPopup")
	local tMessages = utils.MakeFailMessages(_tReasons, _tFailureMessagesOverrides)
	api.debug.Trace("Failure Messages: " .. table.tostring(tMessages))
	local worldScript = api.world.GetScript(api.world.GetActive())
	local tEnvironment = worldScript.tEnvironment
	local cashSpentPopupManager = tEnvironment:RequireInterface("Interfaces.ICashSpentPopupManager")
	cashSpentPopupManager:CreateFailurePopup(_tReasons, tMessages)
end

ImporterUIManager.Shutdown = function(self)
	api.debug.Trace("ImporterUIManager:Shutdown()")
	if self.ui then
		self.ui:Shutdown()
		self.ui = nil
	end
end

Mutators.VerifyManagerModule(ImporterUIManager)
