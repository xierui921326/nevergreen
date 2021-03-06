import React, {ReactElement, useCallback, useEffect, useState} from 'react'
import cn from 'classnames'
import {InterestingProjects} from './InterestingProjects'
import {Success} from './Success'
import {SuccessMessage} from '../common/SuccessMessage'
import {Loading} from '../common/Loading'
import styles from './monitor.scss'
import {isEmpty} from 'lodash'
import {Title} from '../common/Title'
import {useTimer} from '../common/TimerHook'
import {useSelector} from 'react-redux'
import {getRefreshTime, getShowPrognosis, getSort} from '../settings/SettingsReducer'
import {getTrays} from '../tracking/TraysReducer'
import {getSelectedProjects} from '../tracking/SelectedReducer'
import {getKnownProjects} from '../tracking/ProjectsReducer'
import {interesting} from '../gateways/ProjectsGateway'
import {isAbortedRequest, send} from '../gateways/Gateway'
import {Projects, toProjectError, updateProjects} from '../domain/Project'
import {useProjectNotifications} from './ProjectNotificationsHook'

interface MonitorProps {
  readonly fullScreen: boolean;
  readonly requestFullScreen: (fullScreen: boolean) => void;
}

export function Monitor({fullScreen, requestFullScreen}: MonitorProps): ReactElement {
  const refreshTime = useSelector(getRefreshTime)
  const trays = useSelector(getTrays)
  const selected = useSelector(getSelectedProjects)
  const knownProjects = useSelector(getKnownProjects)
  const prognosis = useSelector(getShowPrognosis)
  const sort = useSelector(getSort)

  const [loaded, setLoaded] = useState(false)
  const [projects, setProjects] = useState<Projects>([])

  useEffect(() => {
    requestFullScreen(true)
    return () => {
      requestFullScreen(false)
    }
  }, [requestFullScreen])

  useProjectNotifications(projects)

  const onTrigger = useCallback(async () => {
    const request = interesting(trays, knownProjects, selected, prognosis, sort)

    try {
      const response = await send<Projects>(request)
      setProjects((previouslyFetchedProjects) => updateProjects(response, previouslyFetchedProjects))
      setLoaded(true)
    } catch (e) {
      if (!isAbortedRequest(e)) {
        setProjects([toProjectError(e)])
        setLoaded(true)
      }
    }

    return request.abort.bind(request)
  }, [trays, knownProjects, selected, prognosis, sort])

  useTimer(onTrigger, refreshTime)

  const traysAdded = !isEmpty(trays)
  const success = isEmpty(projects)

  const monitorClassNames = cn(styles.monitor, {
    [styles.fullscreen]: fullScreen
  })

  return (
    <div className={monitorClassNames}>
      <Title>Monitor</Title>
      {!traysAdded && (
        <SuccessMessage message='Add a CI server via the tracking page to start monitoring'/>
      )}
      {traysAdded && (
        <Loading dark={true} loaded={loaded}>
          {success && <Success/>}
          {!success && <InterestingProjects projects={projects}/>}
        </Loading>
      )}
    </div>
  )
}
