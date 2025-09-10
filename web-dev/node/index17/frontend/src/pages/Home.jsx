import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import Banner from '../components/Banner';

const Home = () => {
  const [counters, setCounters] = useState({
    doctors: 0,
    patients: 0,
    centers: 0,
    experience: 0
  });

  // Animate counters
  useEffect(() => {
    const targetValues = {
      doctors: 2000,
      patients: 50000,
      centers: 150,
      experience: 25
    };

    const animateCounter = (key, target) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 50);
    };

    // Start animations with delays
    setTimeout(() => animateCounter('doctors', targetValues.doctors), 500);
    setTimeout(() => animateCounter('patients', targetValues.patients), 700);
    setTimeout(() => animateCounter('centers', targetValues.centers), 900);
    setTimeout(() => animateCounter('experience', targetValues.experience), 1100);
  }, []);

  return (
    <>
      <Banner />

      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Medical Services</h2>
            <p className="section-subtitle">Comprehensive healthcare solutions tailored to your needs</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <h3>General Consultation</h3>
              <p>Expert medical advice and health checkups from certified general practitioners.</p>
              <a href="#" className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3>Cardiology</h3>
              <p>Specialized heart care and cardiovascular disease prevention and treatment.</p>
              <a href="#" className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>Neurology</h3>
              <p>Advanced neurological care for brain and nervous system disorders.</p>
              <a href="#" className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-baby"></i>
              </div>
              <h3>Pediatrics</h3>
              <p>Comprehensive healthcare services for infants, children, and adolescents.</p>
              <a href="#" className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Ophthalmology</h3>
              <p>Complete eye care services including vision correction and eye surgery.</p>
              <a href="#" className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-tooth"></i>
              </div>
              <h3>Dental Care</h3>
              <p>Professional dental services for optimal oral health and beautiful smiles.</p>
              <a href="#" className="service-link">Learn More <i className="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to get the healthcare you need</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>Find Your Doctor</h3>
                <p>Browse through our network of certified doctors and specialists based on your location and needs.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <h3>Book Appointment</h3>
                <p>Select your preferred time slot and book your appointment instantly with real-time availability.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-icon">
                  <i className="fa-solid fa-message"></i>
                </div>
                <h3>Consult & Get Treatment</h3>
                <p>Meet your doctor virtually or in-person and receive personalized treatment and care.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-content">
            <div className="features-text">
              <h2>Why Choose MediCare?</h2>
              <p>We're revolutionizing healthcare access with cutting-edge technology and compassionate care.</p>
              <div className="features-list">
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <div>
                    <h4>Verified Doctors</h4>
                    <p>All doctors are certified and thoroughly vetted for your safety.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h4>Instant Booking</h4>
                    <p>Book appointments in seconds with real-time availability.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <i className="fas fa-shield-alt"></i>
                  <div>
                    <h4>Secure & Private</h4>
                    <p>Your medical data is encrypted and completely confidential.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <i className="fas fa-mobile-alt"></i>
                  <div>
                    <h4>24/7 Access</h4>
                    <p>Access healthcare anytime, anywhere with our mobile platform.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="features-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-interface">
                    <div className="app-header">
                      <span>MediCare App</span>
                    </div>
                    <div className="doctor-card">
                      <div className="doctor-info">
                        <div className="doctor-photo">
                          <img src="https://i.pinimg.com/736x/c5/a3/90/c5a3904b38eb241dd03dd30889599dc4.jpg" alt="Dr. Priya Sharma" />
                        </div>
                        <div className="doctor-details">
                          <h5>Dr. Priya Sharma</h5>
                          <p>Cardiologist</p>
                          <div className="rating">
                            <span>★★★★★</span>
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>
                      <button className="book-btn">Book Now</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="stat-number">{counters.doctors.toLocaleString()}</div>
              <div className="stat-label">Expert Doctors</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-number">{counters.patients.toLocaleString()}</div>
              <div className="stat-label">Happy Patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-hospital"></i>
              </div>
              <div className="stat-number">{counters.centers}</div>
              <div className="stat-label">Medical Centers</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-award"></i>
              </div>
              <div className="stat-number">{counters.experience}</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Patients Say</h2>
            <p className="section-subtitle">Real stories from real people who trust MediCare</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="stars">★★★★★</div>
                <p>"MediCare made it so easy to find and book with a specialist. The entire process was seamless and the doctor was incredibly professional."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">P</div>
                <div className="author-info">
                  <h4>Priya Sharma</h4>
                  <span>Marketing Manager, Mumbai</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="stars">★★★★★</div>
                <p>"I was able to get a consultation within hours of booking. The platform is user-friendly and the doctors are top-notch."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">R</div>
                <div className="author-info">
                  <h4>Rajesh Kumar</h4>
                  <span>Software Engineer, Bangalore</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="stars">★★★★★</div>
                <p>"As a busy parent, MediCare has been a lifesaver. Quick appointments, professional care, and great follow-up support."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div className="author-info">
                  <h4>Anita Patel</h4>
                  <span>Teacher, Delhi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="emergency-section">
        <div className="container">
          <div className="emergency-content">
            <div className="emergency-info">
              <h2>Need Emergency Care?</h2>
              <p>Our emergency hotline is available 24/7 for urgent medical situations. Don't wait - get the help you need right now.</p>
              <div className="emergency-actions">
                <a href="tel:+911234567890" className="emergency-btn">
                  <i className="fas fa-phone"></i>
                  Call Emergency: +91 123-456-7890
                </a>
                <button className="btn btn-outline">
                  <i className="fas fa-ambulance"></i>
                  Find Nearest Hospital
                </button>
              </div>
            </div>
            <div className="emergency-visual">
              <div className="emergency-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Take Control of Your Health?</h2>
            <p>Join thousands of patients who trust MediCare for their healthcare needs. Book your first appointment today and experience the difference.</p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-large">
                <i className="fas fa-calendar-plus"></i>
                Book Your First Appointment
              </button>
              <button className="btn btn-outline btn-large">
                <i className="fas fa-download"></i>
                Download Our App
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;