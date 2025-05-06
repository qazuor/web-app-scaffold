import { createFileRoute } from '@tanstack/react-router';
import { NotFound } from 'src/components/NotFound';
import { UserErrorComponent } from 'src/components/UserError';
import type { User } from 'src/utils/users';
import { DEPLOY_URL } from 'src/utils/users';

export const Route = createFileRoute('/users/$userId')({
    loader: async ({ params: { userId } }) => {
        try {
            const res = await fetch(DEPLOY_URL + '/api/users/' + userId);
            if (!res.ok) {
                throw new Error('Unexpected status code');
            }

            const data = (await res.json()) as User;

            return data;
        } catch {
            throw new Error('Failed to fetch user');
        }
    },
    errorComponent: UserErrorComponent,
    component: UserComponent,
    notFoundComponent: () => {
        return <NotFound>User not found</NotFound>;
    }
});

function UserComponent() {
    const user = Route.useLoaderData();

    return (
        <div className="space-y-2">
            <h4 className="font-bold text-xl underline">{user.name}</h4>
            <div className="text-sm">{user.email}</div>
        </div>
    );
}
