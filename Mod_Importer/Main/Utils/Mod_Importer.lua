---@class Mod_ImporterUtils
local utils = {}

--- Creates a table of failure messages based on the reasons provided.
---@param _tReasons table
---@param _tFailureMessagesOverrides table|nil
---@return table
utils.MakeFailMessages = function(_tReasons, _tFailureMessagesOverrides)
	local tMessages = _tFailureMessagesOverrides or {}

	-- Cost-related failures
	if _tReasons.nCost ~= nil and tMessages.bTooExpensive == nil then
		tMessages.bTooExpensive = "[InsufficientFundsWithValue:Value={" .. _tReasons.nCost .. "}]"
	end

	-- Track-related failures
	if _tReasons.bTrackNotLegal ~= nil and tMessages.bTrackNotLegal == nil then
		tMessages.bTrackNotLegal =
			"[STRING_LITERAL:Value=|Track placement is not legal. This usually means your track is colliding with existing track or another object.|]"
	end

	if _tReasons.bTrackTooHigh ~= nil and tMessages.bTrackTooHigh == nil then
		tMessages.bTrackTooHigh = "[STRING_LITERAL:Value=|Track is too high and cannot be placed at this elevation.|]"
	end

	if _tReasons.bPreExistingTrackSectionsLocked ~= nil and tMessages.bPreExistingTrackSectionsLocked == nil then
		tMessages.bPreExistingTrackSectionsLocked =
			"[STRING_LITERAL:Value=|Cannot modify track - existing track sections are locked or in use.|]"
	end

	if _tReasons.bStationsLocked ~= nil and tMessages.bStationsLocked == nil then
		tMessages.bStationsLocked =
			"[STRING_LITERAL:Value=|Cannot modify ride - stations are currently locked or in use.|]"
	end

	-- Boundary and terrain failures
	if _tReasons.bOutOfBounds ~= nil and tMessages.bOutOfBounds == nil then
		tMessages.bOutOfBounds = "[STRING_LITERAL:Value=|Cannot place track - location is outside the buildable area.|]"
	end

	if _tReasons.bOutOfBounds_TooLow ~= nil and tMessages.bOutOfBounds_TooLow == nil then
		tMessages.bOutOfBounds_TooLow =
			"[STRING_LITERAL:Value=|Cannot place track - location is too low (below minimum elevation).|]"
	end

	if _tReasons.bOutOfBounds_TooHigh ~= nil and tMessages.bOutOfBounds_TooHigh == nil then
		tMessages.bOutOfBounds_TooHigh =
			"[STRING_LITERAL:Value=|Cannot place track - location is too high (above maximum elevation).|]"
	end

	if _tReasons.bUnsuitableTerrainForPlacement ~= nil and tMessages.bUnsuitableTerrainForPlacement == nil then
		tMessages.bUnsuitableTerrainForPlacement =
			"[STRING_LITERAL:Value=|Cannot place track - terrain is unsuitable for this type of construction.|]"
	end

	if _tReasons.bIntersectingTerrain ~= nil and tMessages.bIntersectingTerrain == nil then
		tMessages.bIntersectingTerrain =
			"[STRING_LITERAL:Value=|Cannot place track - track intersects with terrain that cannot be modified.|]"
	end

	if _tReasons.bTerrainEditFailed ~= nil and tMessages.bTerrainEditFailed == nil then
		tMessages.bTerrainEditFailed =
			"[STRING_LITERAL:Value=|Cannot place track - failed to modify terrain as required.|]"
	end

	-- Obstruction failures
	if _tReasons.bObstructed ~= nil and tMessages.bObstructed == nil then
		tMessages.bObstructed = "[STRING_LITERAL:Value=|Cannot place track - location is obstructed by other objects.|]"
	end

	if _tReasons.bObstructedByWater ~= nil and tMessages.bObstructedByWater == nil then
		tMessages.bObstructedByWater = "[STRING_LITERAL:Value=|Cannot place track - location is obstructed by water.|]"
	end

	-- Path-related failures
	if
		_tReasons.bUnsuitableTerrainForPathConnection ~= nil
		and tMessages.bUnsuitableTerrainForPathConnection == nil
	then
		tMessages.bUnsuitableTerrainForPathConnection =
			"[STRING_LITERAL:Value=|Cannot connect path - terrain is unsuitable for path connection.|]"
	end

	if _tReasons.bTooSteepPathPart ~= nil and tMessages.bTooSteepPathPart == nil then
		tMessages.bTooSteepPathPart =
			"[STRING_LITERAL:Value=|Cannot place path - path section is too steep for guests to use.|]"
	end

	if _tReasons.bMalformedPathPart ~= nil and tMessages.bMalformedPathPart == nil then
		tMessages.bMalformedPathPart =
			"[STRING_LITERAL:Value=|Cannot place path - path section is malformed or invalid.|]"
	end

	if _tReasons.bPathMergeUnchanged ~= nil and tMessages.bPathMergeUnchanged == nil then
		tMessages.bPathMergeUnchanged =
			"[STRING_LITERAL:Value=|Path merge operation failed - no changes would be made.|]"
	end

	-- Queue and ride failures
	if _tReasons.bConnectingQueueToExit ~= nil and tMessages.bConnectingQueueToExit == nil then
		tMessages.bConnectingQueueToExit =
			"[STRING_LITERAL:Value=|Invalid queue connection - cannot connect queue directly to ride exit.|]"
	end

	if _tReasons.bInvalidQueue ~= nil and tMessages.bInvalidQueue == nil then
		tMessages.bInvalidQueue = "[STRING_LITERAL:Value=|Queue configuration is invalid or incomplete.|]"
	end

	-- Water ride specific failures
	if _tReasons.bCannotEditFlumeEntrance ~= nil and tMessages.bCannotEditFlumeEntrance == nil then
		tMessages.bCannotEditFlumeEntrance =
			"[STRING_LITERAL:Value=|Cannot modify flume entrance - entrance is protected or in use.|]"
	end

	if _tReasons.bNotAttachedToPlatform ~= nil and tMessages.bNotAttachedToPlatform == nil then
		tMessages.bNotAttachedToPlatform =
			"[STRING_LITERAL:Value=|Track section must be attached to a platform for water rides.|]"
	end

	-- Generic failures
	if _tReasons.bIllegalStandalonePart ~= nil and tMessages.bIllegalStandalonePart == nil then
		tMessages.bIllegalStandalonePart =
			"[STRING_LITERAL:Value=|Cannot place standalone part - this component requires connection to other parts.|]"
	end

	return tMessages
end

return utils
