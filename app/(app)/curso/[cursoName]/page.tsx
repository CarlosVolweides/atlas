"use client";
import { useParams } from 'next/navigation';

export default function CursoPage() {
  const params = useParams();
  return (
    <div>
      <h1>Curso {params.cursoName}</h1>
    </div>
  )
}