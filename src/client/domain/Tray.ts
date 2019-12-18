import nameGenerator from 'project-name-generator'
import uuid from 'uuid/v4'
import {isSick, Project} from './Project'
import {lowerCase} from 'lodash'

export enum AuthTypes {
  none = 'none',
  basic = 'basic',
  token = 'token'
}

export interface Tray {
  readonly authType: AuthTypes;
  readonly encryptedAccessToken?: string;
  readonly encryptedPassword?: string;
  readonly includeNew: boolean;
  readonly name?: string;
  readonly serverType: string;
  readonly timestamp?: string;
  readonly trayId: string;
  readonly url: string;
  readonly username?: string;
}

export const CI_OPTIONS = [
  {value: '', display: 'Generic'},
  {value: 'circle', display: 'CircleCI'},
  {value: 'go', display: 'GoCD'}
]

export function generateRandomName() {
  return lowerCase(nameGenerator().spaced)
}

export function createId() {
  return uuid()
}

export function createTray(trayId: string, url: string, additional: Partial<Tray> = {}) {
  return {
    authType: AuthTypes.none,
    encryptedAccessToken: '',
    encryptedPassword: '',
    includeNew: true,
    name: generateRandomName(),
    serverType: '',
    trayId,
    url,
    username: '',
    ...additional
  }
}

export function sickProjects(projects: ReadonlyArray<Project>): ReadonlyArray<Project> {
  return projects.filter((project) => isSick(project.prognosis))
}
