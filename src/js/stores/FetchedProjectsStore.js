const AppDispatcher = require('../dispatcher/AppDispatcher')
const EventEmitter = require('events').EventEmitter
const eventEmitter = new EventEmitter()
const _ = require('lodash')
const Constants = require('../constants/NevergreenConstants')

const CHANGE_EVENT = 'projects-change'

let _storeState = {}

function previouslyRemovedProjects(project) {
  return !project.wasRemoved
}

function updateNewAndRemovedFlags(fetchedProjects, project) {
  const whereIdsMatch = function(fetchedProject) {
    return fetchedProject.projectId === project.projectId
  }
  return {
    projectId: project.projectId,
    name: project.name,
    isNew: false,
    wasRemoved: _.findIndex(fetchedProjects, whereIdsMatch) < 0
  }
}

function getName(project) {
  return project.stage ? `${project.name} [${project.stage}]` : project.name
}

function toProject(project) {
  return {
    projectId: project.projectId,
    name: getName(project),
    isNew: true,
    wasRemoved: false
  }
}

function removeJobs(project) {
  return _.isNull(project.job)
}

function removeExisting(previousProjects, project) {
  const whereIdsMatch = function(previousProject) {
    return previousProject.projectId === project.projectId
  }
  return _.findIndex(previousProjects, whereIdsMatch) < 0
}

function createProjects(previousProjects, fetchedProjects) {
  return previousProjects
    .filter(previouslyRemovedProjects)
    .map(updateNewAndRemovedFlags.bind(this, fetchedProjects))
    .concat(fetchedProjects
      .filter(removeJobs)
      .map(toProject)
      .filter(removeExisting.bind(this, previousProjects)))
}

const dispatchToken = AppDispatcher.register(action => {
  switch (action.type) {
    case Constants.TrayAdd:
    {
      _storeState[action.trayId] = []
      break
    }
    case Constants.TrayRemove:
    {
      delete _storeState[action.trayId]
      break
    }
    case Constants.ProjectsFetched:
    {
      _storeState[action.trayId] = createProjects(_storeState[action.trayId], action.projects)
      break
    }
    case Constants.ImportedData:
    {
      _storeState = {}
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

  getAll(trayId) {
    return _storeState[trayId] || []
  },

  addListener(callback) {
    eventEmitter.on(CHANGE_EVENT, callback)
  },

  removeListener(callback) {
    eventEmitter.removeListener(CHANGE_EVENT, callback)
  }
}
