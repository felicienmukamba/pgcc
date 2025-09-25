"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fingerprint } from 'lucide-react';

export function FingerprintRecognitionWrapper() {
  const [file, setFile] = useState<File | null>(null);
  const [citizenId, setCitizenId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAction = async (action: 'register' | 'identify') => {
    if (!file) {
      setError('Veuillez sélectionner une image.');
      return;
    }
    if (action === 'register' && !citizenId) {
      setError('Veuillez entrer un ID de citoyen pour l\'enregistrement.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const imageBase64 = await toBase64(file);
      const endpoint = action === 'register' ? '/api/biometric/fingerprint/register' : '/api/biometric/fingerprint/identify';
      const body = action === 'register' ? { imageBase64, citizenId } : { imageBase64 };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResult(data);
      if (!res.ok) {
        throw new Error(data.message || 'Erreur inconnue.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[500px] mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-6 h-6" /> Empreintes digitales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="citizenId">ID du Citoyen</Label>
            <Input id="citizenId" type="text" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="image">Image d'empreinte</Label>
            <Input id="image" type="file" onChange={handleFileChange} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleAction('register')} disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer Empreinte'}
            </Button>
            <Button onClick={() => handleAction('identify')} disabled={loading} variant="secondary">
              {loading ? 'Identification...' : 'Identifier Empreinte'}
            </Button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {result && (
          <div className="mt-4 p-4 border rounded-md">
            {result.success ? (
              <>
                <p className="text-green-500 font-semibold">Succès !</p>
                {result.message && <p>{result.message}</p>}
                {result.citizen && (
                  <p>
                    Citoyen identifié : <strong>{result.citizen.firstName} {result.citizen.lastName}</strong>
                  </p>
                )}
              </>
            ) : (
              <p className="text-red-500 font-semibold">{result.message}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}