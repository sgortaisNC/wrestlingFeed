'use client';

import Link from 'next/link';

export const Show = ({
  show,
  className,
  dateKey,
}: {
  show: { date: string; title: string };
  className: string;
  dateKey: string;
}) => {
  const formattedDate = new Date(show.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const href = `/show/${dateKey}/${encodeURIComponent(show.title)}`;

  return (
    <Link href={href} className={className}>
      <h2>{show.title}</h2>
      <p>{formattedDate}</p>
    </Link>
  );
};
