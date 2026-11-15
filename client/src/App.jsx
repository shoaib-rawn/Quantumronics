import { useEffect, useState } from 'react';
import { getApplications } from './api.js';
import ApplicationItem from './components/ApplicationItem.jsx';
import Pagination from './components/Pagination.jsx';

const PAGE_SIZE = 3;

export default function App() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await getApplications({ page, limit: PAGE_SIZE }, controller.signal);
        setApplications(result.data);
        setPagination(result.pagination);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [page]);

  return (
    <main className="container">
      <h1>JobTrack</h1>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && applications.length === 0 && (
        <p>Koi application nahi mili.</p>
      )}

      <ul className="list">
        {applications.map((app) => (
          <ApplicationItem key={app.id} application={app} />
        ))}
      </ul>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </main>
  );
}
