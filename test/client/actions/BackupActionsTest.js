import {proxyquire} from '../UnitSpec'
import {describe, it, before, beforeEach} from 'mocha'
import {expect} from 'chai'
import Immutable from 'immutable'
import sinon from 'sinon'

describe('BackupActions', function () {
  let BackupActions, LocalRepository, Data

  before(function () {
    LocalRepository = {}
    Data = {}
    BackupActions = proxyquire('../../src/client/actions/BackupActions', {
      '../common/repo/LocalRepository': LocalRepository,
      '../common/repo/Data': Data
    })
  })

  describe('import error', function () {

    it('should return the correct type', function () {
      const actual = BackupActions.importError()
      expect(actual).to.have.property('type', BackupActions.IMPORT_ERROR)
    })

    it('should return the errors given', function () {
      const actual = BackupActions.importError(['some-error'])
      expect(actual).to.have.property('errors').that.contains('some-error')
    })
  })

  describe('importing data', function () {

    it('should return the correct type', function () {
      const actual = BackupActions.importingData()
      expect(actual).to.have.property('type', BackupActions.IMPORTING_DATA)
    })

    it('should return the data given', function () {
      const actual = BackupActions.importingData({foo: 'bar'})
      expect(actual).to.have.property('data').that.contains.property('foo', 'bar')
    })
  })

  describe('imported data', function () {

    it('should return the correct type', function () {
      const actual = BackupActions.importedData()
      expect(actual).to.have.property('type', BackupActions.IMPORTED_DATA)
    })

    it('should return the configuration given', function () {
      const actual = BackupActions.importedData({foo: 'bar'})
      expect(actual).to.have.property('data').that.contains.property('foo', 'bar')
    })

    it('should return a success message', function () {
      const actual = BackupActions.importedData()
      expect(actual).to.have.property('messages').that.is.an.instanceof(Immutable.List)
    })
  })

  describe('loading configuration', function () {

    it('should return the correct type', function () {
      const actual = BackupActions.loadingConfiguration()
      expect(actual).to.have.property('type', BackupActions.LOADING_CONFIGURATION)
    })
  })

  describe('configuration loaded', function () {

    it('should return the correct type', function () {
      const actual = BackupActions.configurationLoaded()
      expect(actual).to.have.property('type', BackupActions.CONFIGURATION_LOADED)
    })

    it('should return the configuration given', function () {
      const actual = BackupActions.configurationLoaded({foo: 'bar'})
      expect(actual).to.have.property('data').that.contains.property('foo', 'bar')
    })
  })

  describe('configuration load error', function () {

    it('should return the correct type', function () {
      const actual = BackupActions.configurationLoadError()
      expect(actual).to.have.property('type', BackupActions.CONFIGURATION_LOAD_ERROR)
    })

    it('should return the errors given', function () {
      const actual = BackupActions.configurationLoadError(['some-error'])
      expect(actual).to.have.property('errors').that.contains('some-error')
    })
  })

  describe('load configuration', function () {
    let dispatch

    beforeEach(function () {
      dispatch = sinon.spy()
    })

    it('should dispatch loading configuration action', function () {
      LocalRepository.load = sinon.stub().returns(Promise.resolve({}))
      BackupActions.loadConfiguration()(dispatch)
      expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.LOADING_CONFIGURATION})
    })

    it('should dispatch configuration loaded action on success', function () {
      LocalRepository.load = sinon.stub().returns(Promise.resolve({}))
      return BackupActions.loadConfiguration()(dispatch).then(() => {
        expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.CONFIGURATION_LOADED})
      })
    })

    it('should dispatch configuration load error action on failure', function () {
      LocalRepository.load = sinon.stub().returns(Promise.reject([]))
      return BackupActions.loadConfiguration()(dispatch).then(() => {
        expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.CONFIGURATION_LOAD_ERROR})
      })
    })
  })

  describe('import data', function () {
    const validJson = '{}'
    let dispatch

    beforeEach(function () {
      dispatch = sinon.spy()
    })

    it('should dispatch import error action on json parse failure', function () {
      BackupActions.importData('{invalidJson')(dispatch)
      expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.IMPORT_ERROR})
    })

    it('should dispatch import error action on validation failure', function () {
      Data.validate = sinon.stub().returns(['some-validation-error'])
      BackupActions.importData(validJson)(dispatch)
      expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.IMPORT_ERROR})
    })

    describe('successful validation', function () {

      beforeEach(function () {
        Data.validate = sinon.stub().returns([])
      })

      it('should dispatch import data action', function () {
        LocalRepository.save = sinon.stub().returns(Promise.resolve({}))
        BackupActions.importData(validJson)(dispatch)
        expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.IMPORTING_DATA})
      })

      it('should dispatch imported data action on successful save', function () {
        LocalRepository.save = sinon.stub().returns(Promise.resolve({}))
        return BackupActions.importData(validJson)(dispatch).then(() => {
          expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.IMPORTED_DATA})
        })
      })

      it('should dispatch import error action on save failure', function () {
        LocalRepository.save = sinon.stub().returns(Promise.reject({}))
        return BackupActions.importData(validJson)(dispatch).then(() => {
          expect(dispatch).to.have.been.calledWithMatch({type: BackupActions.IMPORT_ERROR})
        })
      })
    })
  })
})
