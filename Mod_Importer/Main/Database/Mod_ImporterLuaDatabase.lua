local global = _G
---@diagnostic disable-next-line: undefined-field
local api = global.api ---@type Api
local pairs = global.pairs
local module = global.module
local require = global.require
local tostring = global.tostring

local table = require("Common.tableplus")
local Vector3 = require("Vector3") ---@type Vector3

---@class Mod_ImporterLuaDatabase
local Mod_ImporterLuaDatabase = module(...)

Mod_ImporterLuaDatabase.AddContentToCall = function(_tContentToCall)
	---@diagnostic disable-next-line: undefined-field
	if not api.acse or api.acse.versionNumber < 0.7 then
		return
	end

	table.insert(_tContentToCall, Mod_ImporterLuaDatabase)
end

Mod_ImporterLuaDatabase.Init = function()
	api.debug.Trace("Mod_ImporterLuaDatabase.Init()")
	api.ui2.MapResources("ImporterUI")
end

Mod_ImporterLuaDatabase.Shutdown = function()
	api.debug.Trace("Mod_ImporterLuaDatabase.Shutdown()")
	api.ui2.UnmapResources("ImporterUI")
end

Mod_ImporterLuaDatabase.tManagers = {
	["Environments.CPTEnvironment"] = {
		["Managers.Mod_Importer.UIManager"] = {},
	},
}

Mod_ImporterLuaDatabase.AddLuaManagers = function(_fnAdd)
	api.debug.Trace("Mod_ImporterLuaDatabase.AddLuaManagers()")
	for sManagerName, tParams in pairs(Mod_ImporterLuaDatabase.tManagers) do
		_fnAdd(sManagerName, tParams)
	end
end

Mod_ImporterLuaDatabase.tDatabaseFunctions = {
	ImporterInEditMode = function()
		return Mod_ImporterLuaDatabase.InEditor
	end,
}

Mod_ImporterLuaDatabase.AddDatabaseFunctions = function(_tDatabaseFunctions)
	for sMethod, fnMethod in pairs(Mod_ImporterLuaDatabase.tDatabaseFunctions) do
		_tDatabaseFunctions[sMethod] = fnMethod
	end
end

local function getTrackHolder(nRideID)
	return api.track.GetTrackHolder(nRideID)
end

local trackHolder = nil

local createSelection = nil
local createdSelection = nil

Mod_ImporterLuaDatabase._Hook_TrackEditSelection = function(tModule)
	tModule.Importer_RacingStationSelected = tModule.RacingStationSelected
	tModule.RacingStationSelected = function(self)
		--HACK: In order to run :CreateSelection() we need to be in a specific context. This function has that context.
		if createSelection ~= nil then
			local previousT = createSelection.vstartT
			api.debug.Trace("getting vstart pos")
			---@type Vector3
			local vstart = previousT:GetPos()
			api.debug.Trace("getting rstart")
			---@type Vector3
			local rstart = Vector3:new(0, previousT:GetSlope(), previousT:GetBank())

			api.debug.Trace("vstartT " .. table.tostring(previousT))
			api.debug.Trace("vstart " .. table.tostring(vstart))
			api.debug.Trace("rstart " .. table.tostring(rstart))

			api.debug.Trace("CreateSelection()")
			for i = 1, table.count(createSelection.coasterData) do
				api.debug.Trace("Point " .. table.tostring(i))
				local vpoint = createSelection.coasterData[i]
				---@type Vector3
				local rot = i == 1 and vpoint.rot - rstart or vpoint.rot
				-- local rot = Vector3:new(vpoint.rot:GetX(), vpoint.rot:GetY(), vpoint.rot:GetZ())
				local endT = api.track.CreateJoinPoint(vstart + vpoint.pos, rot, vpoint.twist)
				api.debug.Trace(table.tostring(previousT))
				api.debug.Trace(table.tostring(endT))
				local selection = api.track.CreateSelection(
					trackHolder,
					previousT,
					endT,
					createSelection.sElementName,
					createSelection.tTrackParams,
					createSelection.tTrackResData.tFlexiColourData,
					false
				)
				table.insert(createSelection.tSelections, selection)
				previousT = endT
			end
			createdSelection = createSelection.tSelections
			createSelection = nil
		end

		local selection = self.newSelection
		if selection ~= nil and self.selection ~= nil then
			local section = selection:GetSection(1)
			local nStationLength = api.track.GetUseableStationLength(section)
			local trackEntity = api.track.GetTrackEntity(self.track)
			local oTrackHolder = getTrackHolder(trackEntity)
			if trackHolder ~= self.track then
				api.debug.Trace("Updating trackHolder from " .. tostring(trackHolder) .. " to " .. tostring(self.track))
				api.debug.Trace("track: " .. table.tostring(self.track))
				trackHolder = self.track
			end
			if nStationLength > 0 then
				return api.track.GetIsRacing(oTrackHolder)
			end
		end
		return false
	end
end

Mod_ImporterLuaDatabase._Hook_ImporterUIManager = function(tModule)
	tModule.GetTrackHolder = function(self)
		api.debug.Trace("Mod_ImporterLuaDatabase._Hook_ImporterUIManager_GetTrackHolder()")
		return trackHolder
	end

	tModule.CreateSelection = function(self, data)
		api.debug.Trace("Mod_ImporterLuaDatabase._Hook_ImporterUIManager_CreateSelection()")
		createdSelection = nil
		createSelection = data
	end

	tModule.GetSelection = function(self)
		api.debug.Trace("Mod_ImporterLuaDatabase._Hook_ImporterUIManager_GetSelection()")
		return createdSelection
	end
end

Mod_ImporterLuaDatabase._Hook_TrackEditMode = function(tModule)
	tModule.Importer_TransitionIn = tModule.TransitionIn
	tModule.TransitionIn = function(self, ...)
		api.debug.Trace("Mod_ImporterLuaDatabase._Hook_TrackEditMode_TransitionIn()")
		Mod_ImporterLuaDatabase.InEditor = true
		return self:Importer_TransitionIn(...)
	end
	tModule.Importer_TransitionOut = tModule.TransitionOut
	tModule.TransitionOut = function(self, ...)
		api.debug.Trace("Mod_ImporterLuaDatabase._Hook_TrackEditMode_TransitionOut()")
		Mod_ImporterLuaDatabase.InEditor = false
		return self:Importer_TransitionOut(...)
	end
end

Mod_ImporterLuaDatabase.tDefaultHooks = {
	["Editors.Track.TrackEditMode"] = Mod_ImporterLuaDatabase._Hook_TrackEditMode,
	["Editors.Track.TrackEditSelection"] = Mod_ImporterLuaDatabase._Hook_TrackEditSelection,
	["Managers.Mod_Importer.UIManager"] = Mod_ImporterLuaDatabase._Hook_ImporterUIManager,
}

Mod_ImporterLuaDatabase.AddLuaHooks = function(_fnAdd)
	api.debug.Trace("Mod_ImporterLuaDatabase.AddLuaHooks()")
	for sModuleName, fnHook in pairs(Mod_ImporterLuaDatabase.tDefaultHooks) do
		_fnAdd(sModuleName, fnHook)
	end
end
