import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <SignIn
                appearance={{
                    elements: {
                        formButtonPrimary:
                            'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
                        card: 'shadow-xl',
                    },
                }}
            />
        </div>
    )
}
