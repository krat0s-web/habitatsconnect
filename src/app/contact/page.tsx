'use client';

import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Footer } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="top-10 left-10 absolute bg-primary-400 blur-3xl rounded-full w-96 h-96 animate-pulse" />
          <div className="bottom-10 right-10 absolute bg-secondary-500 blur-3xl rounded-full w-96 h-96 animate-pulse" />
        </div>

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <motion.h1
            className="mb-6 font-bold text-white text-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Contactez-nous
          </motion.h1>
          <motion.p
            className="text-primary-100 text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Nous sommes là pour vous aider. N'hésitez pas à nous contacter pour toute question.
          </motion.p>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="gap-12 grid grid-cols-1 lg:grid-cols-2">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-8 font-bold text-slate-900 text-3xl">Informations de contact</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-primary-500 text-xl mt-1" />
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">Adresse</h3>
                    <p className="text-slate-600">
                      123 Avenue des Habitats<br />
                      75001 Paris, France
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaPhone className="text-primary-500 text-xl mt-1" />
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">Téléphone</h3>
                    <p className="text-slate-600">+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaEnvelope className="text-primary-500 text-xl mt-1" />
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">Email</h3>
                    <p className="text-slate-600">contact@habitatsconnect.fr</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaClock className="text-primary-500 text-xl mt-1" />
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">Horaires</h3>
                    <p className="text-slate-600">
                      Lundi - Vendredi: 9h00 - 18h00<br />
                      Samedi: 10h00 - 16h00<br />
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="mb-4 font-semibold text-slate-900 text-xl">Suivez-nous</h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="bg-primary-100 hover:bg-primary-200 p-3 rounded-full text-primary-600 transition"
                  >
                    <FaEnvelope />
                  </a>
                  <a
                    href="#"
                    className="bg-primary-100 hover:bg-primary-200 p-3 rounded-full text-primary-600 transition"
                  >
                    <FaPhone />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="mb-6 font-bold text-slate-900 text-3xl">Envoyez-nous un message</h2>

                {isSubmitted && (
                  <motion.div
                    className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500" />
                      <p className="text-green-800 font-medium">
                        Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                      </p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name" className="text-slate-700">
                        Nom complet *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-slate-700">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-slate-700">
                      Sujet *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Objet de votre message"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-slate-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Votre message..."
                      className="mt-1 min-h-32"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                  >
                    {isSubmitting ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 font-bold text-slate-900 text-4xl">Questions fréquentes</h2>
            <p className="text-slate-600 text-lg">
              Trouvez rapidement des réponses à vos questions
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'Comment puis-je réserver une propriété ?',
                answer: 'Sélectionnez la propriété qui vous intéresse, choisissez vos dates et suivez le processus de réservation sécurisé.',
              },
              {
                question: 'Quelles sont les conditions d\'annulation ?',
                answer: 'Les conditions varient selon les propriétaires. Vous trouverez les détails dans la description de chaque propriété.',
              },
              {
                question: 'Comment contacter le propriétaire ?',
                answer: 'Utilisez notre système de messagerie intégré une fois votre réservation confirmée.',
              },
              {
                question: 'Les prix incluent-ils les taxes ?',
                answer: 'Oui, tous nos prix sont TTC. Les frais de service sont clairement indiqués.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                className="bg-slate-50 p-6 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <h3 className="mb-3 font-semibold text-slate-900 text-lg">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}