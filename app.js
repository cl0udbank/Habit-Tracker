const App = () => {
  // Load saved data from localStorage on component mount
  const [entries, setEntries] = React.useState(() => {
    const savedEntries = localStorage.getItem('habitEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  // Save entries to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('habitEntries', JSON.stringify(entries));
  }, [entries]);

  // Handler for button press
  const handlePress = () => {
    const newEntry = {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    setEntries([...entries, newEntry]);
  };

  // Handler for exporting data
  const handleExport = () => {
    // Convert entries to CSV format with proper escaping
    const escapeCsvField = (field) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvContent = [
      // Header row
      ['Date', 'Time', 'Timestamp'],
      // Data rows
      ...entries.map(entry => [
        escapeCsvField(new Date(entry.timestamp).toLocaleDateString()),
        escapeCsvField(new Date(entry.timestamp).toLocaleTimeString()),
        escapeCsvField(entry.timestamp)
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set up and trigger download
    link.setAttribute('href', url);
    link.setAttribute('download', `habit-tracking-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process data for the chart
  const chartData = _.chain(entries)
    .groupBy('date')
    .map((group, date) => ({
      date,
      count: group.length
    }))
    .orderBy('date')
    .value();

  // Get today's count
  const todayDate = new Date().toLocaleDateString();
  const todayCount = entries.filter(entry => entry.date === todayDate).length;

  // Components from Recharts we'll use
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = Recharts;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 bg-black min-h-screen text-white">
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <div className="flex flex-row items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Habit Tracker</h2>
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            disabled={entries.length === 0}
          >
            Export Data
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-center py-8">
            <button 
              onClick={handlePress}
              className="w-48 h-48 rounded-full text-2xl bg-white hover:bg-gray-100 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Track
            </button>
            <p className="mt-6 text-xl text-gray-300">Today's Count: {todayCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Daily Progress</h2>
        </div>
        <div className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">History</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-2 px-4 text-left font-medium text-gray-300">Date</th>
                  <th className="py-2 px-4 text-left font-medium text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice().reverse().map((entry, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-2 px-4 text-gray-300">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 text-gray-300">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Make sure to export the component
export default App;