import React from 'react';
import './TeamSection.css';

function TeamSection() {
  const teamMembers = [
    {
      id: 1,
      name: 'Nora Bell',
      role: 'Founder & Artisan',
      image: '/team_founder.webp'
    },
    {
      id: 2,
      name: 'Robert Leo',
      role: 'Master Spice Blender',
      image: '/team_chef.webp'
    },
    {
      id: 3,
      name: 'Alisa Lisa',
      role: 'Lead Sourcer',
      image: '/team_farmer.webp'
    }
  ];

  return (
    <section className="team-section">
      <div className="team-header">
        <span className="section-subtitle">~ The Hands Behind the Magic ~</span>
        <h2 className="section-headline">Meet our master artisans<br/>and farmers.</h2>
      </div>

      <div className="team-container">
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div className="team-card" key={member.id}>
              <div className="team-image-container">
                <img src={member.image} alt={member.name} className="team-img" />
                <div className="team-socials">
                  {/* Social icons could go here */}
                </div>
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;
