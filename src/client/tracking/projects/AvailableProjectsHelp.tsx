import React, {ReactElement} from 'react'
import styles from '../../help/help-article.scss'
import {HelpArticle, HelpProps} from '../../help/HelpArticle'

const KEYWORDS = [
  'tracking',
  'adding',
  'projects',
  'refresh',
  'include all',
  'exclude all',
  'filter'
]

export function AvailableProjectsHelp({searchQuery, helpLink}: HelpProps): ReactElement {
  return (
    <HelpArticle keywords={KEYWORDS}
                 searchQuery={searchQuery}
                 title='CI server projects'
                 page='/tracking'>
      <p>
        Once added you can choose which projects to include for tracking by selecting them.
      </p>
      <dl className={styles.helpSettings}>
        <dt>refresh</dt>
        <dd>
          Fetches the latest list of projects from the CI server. If projects are added, removed or renamed on the
          CI server you will need to refresh to see them in Nevergreen.
        </dd>
        <dt>include all</dt>
        <dd>
          Includes all the currently shown {helpLink('filter')} projects for tracking which means they will be shown on
          the Monitor page.
        </dd>
        <dt>exclude all</dt>
        <dd>
          Excludes all the currently shown {helpLink('filter')} projects for tracking which means they will not be shown
          on the Monitor page.
        </dd>
        <dt>filter</dt>
        <dd>
          Takes a regular expression and filters the visible project list to any projects with matching names. Clear the
          input to show all projects again. The include all and exclude all buttons work on the currently visible
          projects, so filtering can be used to quickly include or exclude a group of projects.
        </dd>
      </dl>
    </HelpArticle>
  )
}