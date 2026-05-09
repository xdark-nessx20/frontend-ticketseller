interface StatusBadgeProps {
  activo: boolean;
}

export function StatusBadge({ activo }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}
