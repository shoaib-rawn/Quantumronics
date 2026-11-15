import StatusBadge from './StatusBadge.jsx';

export default function ApplicationItem({ application }) {
  const { company, role, status, appliedDate } = application;

  return (
    <li className="card">
      <div>
        <h2>{company}</h2>
        <p>{role}</p>
        <small>Applied: {appliedDate ?? 'N/A'}</small>
      </div>
      <StatusBadge status={status} />
    </li>
  );
}
