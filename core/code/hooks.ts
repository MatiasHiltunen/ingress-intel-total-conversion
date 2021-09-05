// PLUGIN HOOKS ////////////////////////////////////////////////////////
// Plugins may listen to any number of events by specifying the name of
// the event to listen to and handing a function that should be exe-
// cuted when an event occurs. Callbacks will receive additional data
// the event created as their first parameter. The value is always a
// hash that contains more details.
//
// For example, this line will listen for portals to be added and print
// the data generated by the event to the console:
// window.addHook('portalAdded', function(data) { log.log(data) });
//
// Boot hook: booting is handled differently because IITC may not yet
//            be available. Have a look at the plugins in plugins/. All
//            code before “// PLUGIN START” and after “// PLUGIN END” is
//            required to successfully boot the plugin.
//
// Here’s more specific information about each event:
// portalSelected: called when portal on map is selected/unselected.
//              Provide guid of selected and unselected portal.
// mapDataRefreshStart: called when we start refreshing map data
// mapDataEntityInject: called just as we start to render data. has callback to inject cached entities into the map render
// mapDataRefreshEnd: called when we complete the map data load
// portalAdded: called when a portal has been received and is about to
//              be added to its layer group. Note that this does NOT
//              mean it is already visible or will be, shortly after.
//              If a portal is added to a hidden layer it may never be
//              shown at all. Injection point is in
//              code/map_data.js#renderPortal near the end. Will hand
//              the Leaflet CircleMarker for the portal in "portal" var.
// linkAdded:   called when a link is about to be added to the map
// fieldAdded:  called when a field is about to be added to the map
// portalRemoved: called when a portal has been removed
// linkRemoved: called when a link has been removed
// fieldRemoved: called when a field has been removed
// portalDetailsUpdated: fired after the details in the sidebar have
//              been (re-)rendered Provides data about the portal that
//              has been selected.
// publicChatDataAvailable: this hook runs after data for any of the
//              public chats has been received and processed, but not
//              yet been displayed. The data hash contains both the un-
//              processed raw ajax response as well as the processed
//              chat data that is going to be used for display.
// factionChatDataAvailable: this hook runs after data for the faction
//              chat has been received and processed, but not yet been
//              displayed. The data hash contains both the unprocessed
//              raw ajax response as well as the processed chat data
//              that is going to be used for display.
// requestFinished: DEPRECATED: best to use mapDataRefreshEnd instead
//              called after each map data request finished. Argument is
//              {success: boolean} indicated the request success or fail.
// iitcLoaded: called after IITC and all plugins loaded
// portalDetailLoaded: called when a request to load full portal detail
//              completes. guid, success, details parameters
// paneChanged  called when the current pane has changed. On desktop,
//              this only selects the current chat pane; on mobile, it
//              also switches between map, info and other panes defined
//              by plugins
// artifactsUpdated: called when the set of artifacts (including targets)
//              has changed. Parameters names are old, new.
// nicknameClicked:
// geoSearch:
// search:
import $ from 'jquery'

let _hooks: {} = {};
/* let VALID_HOOKS = []; // stub for compatibility */

let isRunning: number = 0;

export const runHooks = function(event:string, data?) {

  if (event in _hooks) { return true; }


  let interrupted = false;
  isRunning++;


  for(let key in _hooks){
    try {
      if(key === event) {
        if (_hooks[key](data) === false) {
          interrupted = true;
          break; // break from $.each
        }
      }
    } catch (e) {
      console.error('error running hook '+event+', error: '+e);
    }

  }
/* 
  $.each(_hooks[event], function (ind, callback) {
  console.log("HOOK RAN", ind)
    try {
      if (callback(data) === false) {
        interrupted = true;
        return false; // break from $.each
      }
    } catch (e) {
      console.error('error running hook '+event+', error: '+e);
    }
  }); */
  isRunning--;
  return !interrupted;
};

/* window.pluginCreateHook = function() {}; // stub for compatibility */

export const addHook = function(event:string, callback:Function) {

  if (!_hooks[event]) {
    _hooks[event] = [callback];
  } else {
    _hooks[event].push(callback);
  }
};

// callback must the SAME function to be unregistered.
export const removeHook = function(event:string, callback: Function) {

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function.');
  }

  let listeners = _hooks[event];
  if (listeners) {
    let index = listeners.indexOf(callback);
    if (index === -1) {
      console.warn("Callback wasn't registered for this event.");
    } else {
      if (isRunning) {
        listeners[index] = $.noop; 
        _hooks[event] = listeners = listeners.slice();
      }
      listeners.splice(index, 1);
    }
  }
};