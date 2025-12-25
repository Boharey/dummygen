function PreviewTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="preview-empty" data-testid="preview-empty">
        <p>No data to display</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="preview-table-container" data-testid="preview-table">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>
                    {typeof row[col] === 'object'
                      ? JSON.stringify(row[col])
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PreviewTable;
