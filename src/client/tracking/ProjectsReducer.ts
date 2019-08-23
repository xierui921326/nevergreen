import {Actions} from '../Actions'
import {Project} from '../domain/Project'
import {get, merge} from 'lodash'
import {ActionProjectsFetched, ActionRemoveTray, ActionTrayAdded} from './TrackingActionCreators'
import {createReducer} from 'redux-starter-kit'
import {ActionSetConfiguration} from '../NevergreenActionCreators'
import {State} from '../Reducer'

interface ProjectByIdState {
  [projectId: string]: Project;
}

export interface ProjectsState {
  readonly [trayId: string]: ProjectByIdState;
}

function byProjectId(acc: ProjectByIdState, current: Project) {
  acc[current.projectId] = current
  return acc
}

export const PROJECTS_ROOT = 'projects'

const DEFAULT_STATE: ProjectsState = {}

export const reduce = createReducer<ProjectsState>(DEFAULT_STATE, {
  [Actions.SET_CONFIGURATION]: (draft, action: ActionSetConfiguration) => {
    return action.configuration[PROJECTS_ROOT]
      ? action.configuration[PROJECTS_ROOT] as ProjectsState
      : draft
  },
  [Actions.TRAY_ADDED]: (draft, action: ActionTrayAdded) => {
    draft[action.trayId] = {}
  },
  [Actions.REMOVE_TRAY]: (draft, action: ActionRemoveTray) => {
    delete draft[action.trayId]
  },
  [Actions.PROJECTS_FETCHED]: (draft, action: ActionProjectsFetched) => {
    const fetched = action.data.reduce(byProjectId, {})

    draft[action.trayId] = merge(Object.values(draft[action.trayId])
        .filter((project) => !project.removed)
        .map((project) => ({...project, removed: true, isNew: false}))
        .reduce(byProjectId, {}),
      fetched)
  }
})

export function getProjects(state: State, trayId?: string): Project[] {
  return trayId
    ? Object.values<Project>(get(state, [PROJECTS_ROOT, trayId], {}))
    : Object.values(get(state, [PROJECTS_ROOT], {}))
      .flatMap((projectsById) => Object.values(projectsById))
}