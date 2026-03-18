import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookForm from '../components/BookForm';
import PageHeader from '../components/PageHeader';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function AddBookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, reset) => {
    setLoading(true);
    setError('');

    try {
      await api.post('/books', {
        ...values,
        location: values.location || user.location,
      });
      reset();
      navigate('/profile/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {error ? <div className="rounded-2xl bg-coral/10 px-5 py-4 text-sm font-medium text-coral">{error}</div> : null}

      <BookForm
        submitLabel="Publish listing"
        loading={loading}
        onSubmit={handleSubmit}
        defaultValues={{ location: user?.location || '' }}
      />
    </div>
  );
}

