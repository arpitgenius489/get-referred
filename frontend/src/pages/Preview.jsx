import React from 'react';
import { motion } from 'framer-motion';

export default function Preview() {
  const steps = [
    {
      title: "Create Your Profile",
      description: "Set up your professional profile with your experience, skills, and preferences",
      icon: "👤"
    },
    {
      title: "Browse Available Companies",
      description: "Explore our network of partner companies and find your dream workplace",
      icon: "🏢"
    },
    {
      title: "Submit Referral Requests",
      description: "Apply for positions with a request for internal referral",
      icon: "📝"
    },
    {
      title: "Connect with Employees",
      description: "Get matched with current employees who can refer you",
      icon: "🤝"
    },
    {
      title: "Get Referred & Land Your Dream Job",
      description: "Receive your referral and increase your chances of getting hired",
      icon: "🌟"
    }
  ];

  const benefits = [
    {
      title: "Higher Success Rate",
      description: "Referred candidates are 15x more likely to be hired",
      icon: "📈"
    },
    {
      title: "Direct Employee Connection",
      description: "Connect directly with employees who can refer you",
      icon: "🔗"
    },
    {
      title: "Verified Referrers",
      description: "All referrers are verified current employees",
      icon: "✅"
    },
    {
      title: "Track Your Status",
      description: "Real-time updates on your referral requests",
      icon: "📊"
    },
    {
      title: "Profile Assistance",
      description: "Get help optimizing your professional profile",
      icon: "💼"
    }
  ];

  const comparisonData = {
    regular: {
      title: "Regular Application",
      points: [
        "7% average response rate",
        "45+ days average hiring time",
        "Compete with 250+ applicants",
        "No internal advocate",
        "Basic application visibility"
      ],
      color: "gray"
    },
    referred: {
      title: "Referred Application",
      points: [
        "85% response rate",
        "25 days average hiring time",
        "Compete with 20-30 referrals",
        "Internal employee advocate",
        "Priority application review"
      ],
      color: "primary"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-100 hidden md:block" />
            
            {/* Steps */}
            <div className="space-y-12">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={\`flex flex-col md:flex-row items-center \${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  } gap-8 relative\`}
                >
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold relative z-10">
                    {index + 1}
                  </div>
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Get Referred */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Get Referred
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Benefits Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Application Comparison
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(comparisonData).map(([key, data], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={\`p-8 rounded-xl \${
                  key === 'referred'
                    ? 'bg-primary-50 border-2 border-primary-200'
                    : 'bg-gray-50'
                }\`}
              >
                <h3 className={\`text-2xl font-bold mb-6 \${
                  key === 'referred' ? 'text-primary-600' : 'text-gray-700'
                }\`}>
                  {data.title}
                </h3>
                <ul className="space-y-4">
                  {data.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className={\`text-lg \${
                        key === 'referred' ? 'text-primary-500' : 'text-gray-500'
                      }\`}>
                        {key === 'referred' ? '✓' : '•'}
                      </span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
