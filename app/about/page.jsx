import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const AboutPage = () => {
  const values = [
    {
      title: "Security First",
      description:
        "Every product is selected for real-world protection, tested durability, and long-term confidence.",
    },
    {
      title: "Premium Craftsmanship",
      description:
        "We combine elegant finishes with reinforced structures so you get both prestige and performance.",
    },
    {
      title: "Trusted Support",
      description:
        "From product selection to post-purchase guidance, our team stays committed to your satisfaction.",
    },
  ];

  const stats = [
    { label: "Years of service", value: "10+" },
    { label: "Product categories", value: "30+" },
    { label: "Satisfied customers", value: "1,000+" },
    { label: "Installations supported", value: "2,500+" },
  ];

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-20 mx-auto h-64 w-[80%] rounded-full bg-[#e2bf86]/30 blur-3xl" />
      <Navbar />

      <section className="lux-shell section-wrap pb-14">
        <div className="soft-card p-6 md:p-10 lg:p-12">
          <p className="section-eyebrow">About Chericheri</p>
          <h1 className="section-title max-w-3xl text-balance">Building safer and more elegant spaces across Ghana</h1>
          <p className="section-copy max-w-3xl">
            Chericheri Group delivers premium security doors, interior fittings, and modern home essentials for
            residential and commercial properties. Our mission is simple: protect what matters while elevating how
            spaces look and feel.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white/80 p-4 md:p-5">
                <p className="text-2xl md:text-3xl font-semibold text-[#a96d1d]">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <article className="soft-card p-6 md:p-8">
            <p className="section-eyebrow">Our Story</p>
            <h2 className="text-2xl md:text-3xl mt-2">A reputation built on quality and trust</h2>
            <p className="text-gray-600 mt-4 leading-7">
              We started with one goal: to make high-quality entry solutions more accessible without sacrificing style.
              Over the years, we expanded into curated accessories and interior essentials, helping clients complete
              their spaces with confidence.
            </p>
            <p className="text-gray-600 mt-4 leading-7">
              Today, we continue to grow by listening to customer needs, sourcing dependable products, and maintaining
              a service-first approach in every interaction.
            </p>
          </article>

          <article className="soft-card p-6 md:p-8">
            <p className="section-eyebrow">Our Promise</p>
            <h2 className="text-2xl md:text-3xl mt-2">Reliable products. Honest service.</h2>
            <div className="space-y-4 mt-5">
              {values.map((value) => (
                <div key={value.title} className="rounded-xl border border-gray-200 bg-white/85 p-4">
                  <p className="font-semibold text-gray-900">{value.title}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-6">{value.description}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="soft-card mt-8 p-6 md:p-8 lg:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="section-eyebrow">Work with us</p>
            <h2 className="text-2xl md:text-3xl mt-2">Ready to upgrade your property?</h2>
            <p className="text-gray-600 mt-3 max-w-2xl">
              Explore our collection or speak with our team to find the right solution for your home or project.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/all-products" className="btn-primary">
              Browse products
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact our team
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AboutPage;
