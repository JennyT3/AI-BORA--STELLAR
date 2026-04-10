import { useState, useEffect } from 'react';

export function QuemSomosSection() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const teamMembers = [
    {
      name: "Jenny Tejedor",
      role: "Founder, CEO & Technical Lead",
      image: "/jenny-photo.jpg"
    },
    {
      name: "Bora",
      role: "Customer Experience AI",
      image: "/bora-photo..jpg"
    }
  ];

  useEffect(() => {
    teamMembers.forEach((member, index) => {
      const img = new Image();
      img.onload = () => setLoadedImages(prev => ({ ...prev, [index]: true }));
      img.onerror = () => setImageErrors(prev => ({ ...prev, [index]: true }));
      img.src = member.image;
    });
  }, []);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <section id="quem-somos" className="py-24" style={{ backgroundColor: '#F5F2F0' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title with accent bar */}
        <div className="mb-8">
          <div className="w-16 h-1 mb-3" style={{ backgroundColor: '#F25C05' }}></div>
          <h2 style={{fontSize:"clamp(28px, 4vw, 42px)",fontWeight:900,fontFamily:'Montserrat',lineHeight:1.2}} className="text-text-primary">
            Who we are
          </h2>
        </div>

        {/* Two paths — below title */}
        <div className="mb-12">
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed" style={{fontFamily:'Montserrat'}}>
            The team that lets you choose two paths:<br/>
            <span className="font-semibold text-text-primary">We either teach you how to do it, or we do it all for you.</span>
          </p>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center mb-12">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center text-center w-full max-w-xs">
              <div className="w-56 h-56 mb-4 overflow-hidden" style={{ borderRadius: '12px' }}>
                {imageErrors[index] ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                ) : !loadedImages[index] ? (
                  <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                    <span className="text-4xl text-gray-300">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                ) : (
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
              <h4 className="text-xl font-bold text-text-primary" style={{fontFamily:'Montserrat'}}>
                {member.name}
              </h4>
              <p className="text-sm text-text-secondary mt-1" style={{fontFamily:'Montserrat', fontWeight: 600}}>
                {member.role}
              </p>
            </div>
          ))}
        </div>

        {/* Main copy */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-text-secondary leading-relaxed" style={{fontFamily:'Montserrat'}}>
            AIBORA was born with a simple mission: make digital marketing straightforward for local businesses in Portugal.
          </p>
        </div>

        {/* Commitment */}
        <div className="text-center mt-8">
          <h3 className="text-xl font-bold" style={{fontFamily:'Montserrat', color: '#E11D48'}}>
            Fully committed to your success
          </h3>
        </div>

      </div>
    </section>
  );
}
