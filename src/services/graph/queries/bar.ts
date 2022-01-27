import gql from 'graphql-tag'

export const barQuery = gql`
  query barQuery($id: String! = "0x8798249c2e607446efb7ad49ec89dd1865ff4272", $block: Block_height) {
    bar(id: $id, block: $block) {
      id
      totalSupply
      ratio
      xHotpotMinted
      xHotpotBurned
      hotpotStaked
      hotpotStakedUSD
      hotpotHarvested
      hotpotHarvestedUSD
      xHotpotAge
      xHotpotAgeDestroyed
      # histories(first: 1000) {
      #   id
      #   date
      #   timeframe
      #   hotpotStaked
      #   hotpotStakedUSD
      #   hotpotHarvested
      #   hotpotHarvestedUSD
      #   xHotpotAge
      #   xHotpotAgeDestroyed
      #   xHotpotMinted
      #   xHotpotBurned
      #   xHotpotSupply
      #   ratio
      # }
    }
  }
`

export const barHistoriesQuery = gql`
  query barHistoriesQuery {
    histories(first: 1000) {
      id
      date
      timeframe
      hotpotStaked
      hotpotStakedUSD
      hotpotHarvested
      hotpotHarvestedUSD
      xHotpotAge
      xHotpotAgeDestroyed
      xHotpotMinted
      xHotpotBurned
      xHotpotSupply
      ratio
    }
  }
`

export const barUserQuery = gql`
  query barUserQuery($id: String!) {
    user(id: $id) {
      id
      bar {
        totalSupply
        hotpotStaked
      }
      xHotpot
      hotpotStaked
      hotpotStakedUSD
      hotpotHarvested
      hotpotHarvestedUSD
      xHotpotIn
      xHotpotOut
      xHotpotOffset
      xHotpotMinted
      xHotpotBurned
      hotpotIn
      hotpotOut
      usdIn
      usdOut
      createdAt
      createdAtBlock
    }
  }
`
