-----------------------------------------------------------------------
--/  @file   Database.mod_importer.lua
--/  @author parker02311
--/
--/  @see    https://github.com/OpenNaja/ACSE
-----------------------------------------------------------------------
local global = _G
---@diagnostic disable-next-line: undefined-field
local api = global.api ---@type Api
local require = global.require
local module = global.module

local Object = require("Common.object")
local GamefaceUIWrapper = require("UI.GamefaceUIWrapper")

---@class ImporterUI
---@field TriggerEventAtNextAdvance fun(self, sEventName: string, ...)
---@field AddGlobalEnvironmentEventListener fun(self, sEventName: string, nPriority: number, fnCallback: function, _self: any): number
---@field Shutdown fun(self)
local ImporterUI = module(..., Object.subclass(GamefaceUIWrapper))
local ObjectNew = ImporterUI.new

ImporterUI.new = function(self, _fnOnReadyCallback)
	api.debug.Trace("ImporterUI.new()")

	local oNewImporterUI = ObjectNew(ImporterUI)
	local tInitSettings = {
		sViewName = "importer",
		sViewAddress = "coui://UIGameface/importer.html",
		bStartEnabled = true,
		fnOnReadyCallback = _fnOnReadyCallback,
		nViewDepth = 0,
		nViewWidth = 1920,
		nViewHeight = 1080,
		bRegisterWrapper = true,
	}
	oNewImporterUI:Init(tInitSettings)
	return oNewImporterUI
end

ImporterUI.Show = function(self)
	api.debug.Trace("ImporterUI.Show()")
	self:TriggerEventAtNextAdvance("Show")
end

ImporterUI.Hide = function(self)
	api.debug.Trace("ImporterUI.Hide()")
	self:TriggerEventAtNextAdvance("Hide")
end

---@param show boolean
ImporterUI.SetButtonsShow = function(self, show)
	api.debug.Trace("ImporterUI.SetButtonsShow()")
	self:TriggerEventAtNextAdvance("SetButtonsShow", show)
end

ImporterUI.AddListener_ImporterImport = function(self, _callback, _self)
	api.debug.Trace("ImporterUI.AddListener_ImporterImport()")
	return self:AddGlobalEnvironmentEventListener("ImporterImport", 0, _callback, _self)
end

ImporterUI.AddListener_ImporterAccept = function(self, _callback, _self)
	api.debug.Trace("ImporterUI.AddListener_ImporterAccept()")
	return self:AddGlobalEnvironmentEventListener("ImporterAccept", 0, _callback, _self)
end

ImporterUI.AddListener_ImporterCancel = function(self, _callback, _self)
	api.debug.Trace("ImporterUI.AddListener_ImporterCancel()")
	return self:AddGlobalEnvironmentEventListener("ImporterCancel", 0, _callback, _self)
end
