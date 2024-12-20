import PremierLeagueTable from './components/PremierLeagueTable'
import DataChart from './components/DataChart'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#222222] text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold ">Soccer Visualizer</h1>
        </div>
      </nav>
      <main>
        <PremierLeagueTable />
        <DataChart />
      </main>
    </div>
  )
}

export default App
