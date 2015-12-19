const AppDispatcher = require('../dispatcher/AppDispatcher')
const EventEmitter = require('events').EventEmitter
const eventEmitter = new EventEmitter()
const _ = require('lodash')
const Constants = require('../constants/NevergreenConstants')

const CHANGE_EVENT = 'tray-change'

const _storeState = {
  trays: {},
  validation: {}
}

function addTray(action) {
  _storeState.trays[action.trayId] = {
    trayId: action.trayId,
    url: action.url,
    username: action.username
  }
}

function removeTray(trayId) {
  delete _storeState.trays[trayId]
}

function clearAllTrays() {
  _storeState.trays = {}
}

function setTrayError(trayId, error) {
  _storeState.trays[trayId].error = error
}

function clearTrayError(trayId) {
  _storeState.trays[trayId].error = null
}

function setTrayFetching(trayId) {
  _storeState.trays[trayId].fetching = true
}

function setTrayFetched(trayId) {
  _storeState.trays[trayId].fetching = false
}

function setTrayPassword(trayId, password) {
  _storeState.trays[trayId].password = password
}

function clearValidation() {
  _storeState.validation = {}
}

function setValidation(action) {
  _storeState.validation.messages = action.messages
  _storeState.validation.url = action.url
  _storeState.validation.username = action.username
  _storeState.validation.password = action.password
}

const dispatchToken = AppDispatcher.register(action => {
  switch (action.type) {
    case Constants.PasswordEncrypted:
    {
      setTrayPassword(action.trayId, action.password)
      clearTrayError(action.trayId)
      break
    }
    case Constants.TrayAdd:
    {
      addTray(action)
      clearValidation()
      break
    }
    case Constants.TrayInvalidInput:
    {
      setValidation(action)
      break
    }
    case Constants.TrayRemove:
    {
      removeTray(action.trayId)
      break
    }
    case Constants.ProjectsFetching:
    {
      setTrayFetching(action.trayId)
      clearTrayError(action.trayId)
      break
    }
    case Constants.ProjectsFetched:
    {
      setTrayFetched(action.trayId)
      clearTrayError(action.trayId)
      break
    }
    case Constants.ApiError:
    {
      setTrayFetched(action.trayId)
      setTrayError(action.trayId, action.error)
      break
    }
    case Constants.ImportedData:
    {
      clearAllTrays()
      break
    }
    default :
    {
      return true
    }
  }

  eventEmitter.emit(CHANGE_EVENT)
  return true
})

module.exports = {
  dispatchToken: dispatchToken,

  getAll() {
    return _.values(_storeState.trays)
  },

  getById(trayId) {
    return _storeState.trays[trayId]
  },

  getValidationObject() {
    return _storeState.validation
  },

  addListener(callback) {
    eventEmitter.on(CHANGE_EVENT, callback)
  },

  removeListener(callback) {
    eventEmitter.removeListener(CHANGE_EVENT, callback)
  }
}
