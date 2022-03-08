import fetch from 'jest-fetch-mock'

fetch.enableMocks()
fetch.dontMock()
// require('jest-fetch-mock').enableMocks()

// fetchMock.dontMock()

jest.setTimeout(1000)
