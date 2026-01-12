
'use client';
 
import { useActionState } from 'react';
import { authenticate } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
 
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl text-center">FridgeMaster Login</CardTitle>
        </CardHeader>
        <CardContent>
            <form action={formAction} className="space-y-4">
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
                />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                type="password"
                name="password"
                required
                minLength={6}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isPending} className="w-full">
                Log in
                </Button>
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                    )}
                </div>
            </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
