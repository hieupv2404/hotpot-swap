import { ChainId } from '@hotpot-swap/core-sdk'
import { GRAPH_HOST } from '../constants'
import { request } from 'graphql-request'
import { barHistoriesQuery, barQuery } from '../queries/bar'

const fetcher = async (query, variables = undefined) =>
  request(`${GRAPH_HOST[ChainId.ETHEREUM]}/subgraphs/name/hotpot-swap/hotpotbar`, query, variables)

export const getBar = async (variables = undefined) => {
  const { bar } = await fetcher(barQuery, variables)
  if (!bar) {
    return {
      ratio: 1.219597128713964449716858143559358,
      totalSupply: 56494138.030138239433746454,
    }
  }
  return bar
}

export const getBarHistory = async (variables = undefined) => {
  const { histories } = await fetcher(barHistoriesQuery, variables)
  return histories
}
