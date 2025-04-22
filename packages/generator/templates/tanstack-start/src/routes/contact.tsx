'use client';

import { Field, useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/contact')({
    component: ContactPage,
});

// Esquema de validación con Zod
const contactSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Correo electrónico inválido'),
    message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type ContactForm = z.infer<typeof contactSchema>;

function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<ContactForm>({
        defaultValues: {
            name: '',
            email: '',
            message: '',
        },
        onSubmit: async ({ value }: { value: ContactForm }) => {
            // Simular envío de formulario
            console.log('Formulario enviado:', value);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSubmitted(true);
        },
        validatorAdapter: {
            validate: (values: ContactForm) => {
                const result = contactSchema.safeParse(values);
                if (result.success) {
                    return { success: true, data: result.data };
                }

                // Convertir errores de Zod al formato esperado por Tanstack Form
                const errors: Record<string, string> = {};
                for (const error of result.error.errors) {
                    const path = error.path.join('.');
                    errors[path] = error.message;
                }

                return { success: false, error: errors };
            },
        },
    });

    if (submitted) {
        return (
            <div className="max-w-md mx-auto text-center py-12">
                <h2 className="text-2xl font-bold mb-4">¡Gracias por contactarnos!</h2>
                <p className="mb-6">Hemos recibido tu mensaje y te responderemos pronto.</p>
                <button
                    type="button"
                    onClick={() => {
                        form.reset();
                        setSubmitted(false);
                    }}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                >
                    Enviar otro mensaje
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Contacto</h1>

            <div className="bg-card rounded-lg p-6 shadow-md">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-6"
                >
                    <Field
                        name="name"
                        form={form}
                        render={({ state, handleChange, handleBlur }) => (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Nombre
                                </label>
                                <input
                                    id="name"
                                    value={state.value}
                                    onChange={(e) => handleChange(e.target.value)}
                                    onBlur={handleBlur}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {state.meta.touchedErrors ? (
                                    <div className="text-destructive text-sm mt-1">
                                        {state.meta.touchedErrors}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    />

                    <Field
                        name="email"
                        form={form}
                        render={({ state, handleChange, handleBlur }) => (
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={state.value}
                                    onChange={(e) => handleChange(e.target.value)}
                                    onBlur={handleBlur}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {state.meta.touchedErrors ? (
                                    <div className="text-destructive text-sm mt-1">
                                        {state.meta.touchedErrors}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    />

                    <Field
                        name="message"
                        form={form}
                        render={({ state, handleChange, handleBlur }) => (
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Mensaje
                                </label>
                                <textarea
                                    id="message"
                                    value={state.value}
                                    onChange={(e) => handleChange(e.target.value)}
                                    onBlur={handleBlur}
                                    rows={5}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {state.meta.touchedErrors ? (
                                    <div className="text-destructive text-sm mt-1">
                                        {state.meta.touchedErrors}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    />

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={form.state.isSubmitting}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                        >
                            {form.state.isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
