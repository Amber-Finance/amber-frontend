import useMarketsData from '@/hooks/redBank/useMarketsData'

export default function TvlChart() {
  const { data: marketsData } = useMarketsData(undefined, 2)

  console.log(marketsData, 'marketsData')
  return <div>TvlChart</div>
}
