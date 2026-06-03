import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import FilterSidebar from '../components/FilterSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import backendUrl from '../utils/BackendURL';
import '../styles/Doctors.css';

const Doctors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedDoctors, setHasLoadedDoctors] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocationLoaded, setUserLocationLoaded] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    minRating: '',
    maxFee: '',
    minFee: '',
    experience: '',
    showLocalOnly: false,
    userCity: '',
    search: '' // Added search filter
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0,
    hasNextPage: false
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    specializations: []
  });

  // Grouped doctors by specialization
  const [groupedDoctors, setGroupedDoctors] = useState({});
  const [showMoreStates, setShowMoreStates] = useState({});

  // Sorting
  const [sortBy, setSortBy] = useState('ratings.average');
  const [sortOrder, setSortOrder] = useState('desc');

  // Parse URL parameters and update filters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newFilters = { ...filters };
    let hasChanges = false;

    // Handle search parameter
    const searchQuery = searchParams.get('search');
    if (searchQuery && searchQuery !== filters.search) {
      newFilters.search = searchQuery;
      hasChanges = true;
    }

    // Handle specialization parameter
    const specialization = searchParams.get('specialization');
    if (specialization && specialization !== filters.specialization) {
      newFilters.specialization = specialization;
      hasChanges = true;
    }

    // Handle city parameter
    const city = searchParams.get('city');
    if (city && city !== filters.city) {
      newFilters.city = city;
      hasChanges = true;
    }

    // Handle other parameters
    const minRating = searchParams.get('minRating');
    if (minRating && minRating !== filters.minRating) {
      newFilters.minRating = minRating;
      hasChanges = true;
    }

    const maxFee = searchParams.get('maxFee');
    if (maxFee && maxFee !== filters.maxFee) {
      newFilters.maxFee = maxFee;
      hasChanges = true;
    }

    const minFee = searchParams.get('minFee');
    if (minFee && minFee !== filters.minFee) {
      newFilters.minFee = minFee;
      hasChanges = true;
    }

    const experience = searchParams.get('experience');
    if (experience && experience !== filters.experience) {
      newFilters.experience = experience;
      hasChanges = true;
    }

    if (hasChanges) {
      console.log('URL parameters detected, updating filters:', newFilters);
      setFilters(newFilters);
    }
  }, [location.search]);

  // FIXED: Fetch actual user location from database
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found, user not logged in');
          setUserLocationLoaded(true);
          return;
        }

        const response = await fetch(`${backendUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Current user data:', data);
          
          if (data.success && data.user) {
            setCurrentUser(data.user);
            
            // Extract location from user data
            const userLocationData = {
              city: data.user.address?.city || null,
              state: data.user.address?.state || null,
              country: data.user.address?.country || 'India'
            };
            
            console.log('Setting user location:', userLocationData);
            console.log('User address from DB:', data.user.address);
            
            setUserLocation(userLocationData);
            
            if (userLocationData.city) {
              console.log('✅ User city found:', userLocationData.city);
            } else {
              console.log('❌ No user city found in database');
              console.log('Full user object:', data.user);
            }
          }
        } else {
          console.error('Failed to fetch current user');
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setUserLocationLoaded(true);
      }
    };

    fetchCurrentUser();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('=== DOCTORS PAGE DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('User location:', userLocation);
    console.log('User location loaded:', userLocationLoaded);
    console.log('Filters:', filters);
    console.log('URL Search params:', location.search);
    console.log('===========================');
  }, [currentUser, userLocation, userLocationLoaded, filters, location.search]);

  // Fetch doctors data
  const fetchDoctors = async (page = 1) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder
      });

      // Add all active filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== false && value !== '') {
          queryParams.set(key, value.toString());
        }
      });

      console.log('API Query params:', queryParams.toString());

      const response = await fetch(`${backendUrl}/api/doctors?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        setDoctors(data.data.doctors);
        setFilterOptions(data.data.filters);
        setPagination(data.data.pagination);
        
        // Group doctors by specialization
        groupDoctorsBySpecialization(data.data.doctors);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch doctors');
      console.error('Fetch doctors error:', err);
    } finally {
      setLoading(false);
      setHasLoadedDoctors(true);
    }
  };

  // Group doctors by specialization
  const groupDoctorsBySpecialization = (doctorList) => {
    const grouped = doctorList.reduce((acc, doctor) => {
      const spec = doctor.specialization || 'general';
      if (!acc[spec]) {
        acc[spec] = [];
      }
      acc[spec].push(doctor);
      return acc;
    }, {});

    setGroupedDoctors(grouped);
    
    // Initialize show more states
    const showMoreInitial = {};
    Object.keys(grouped).forEach(spec => {
      showMoreInitial[spec] = 10; // Show first 10 doctors
    });
    setShowMoreStates(showMoreInitial);
  };

  // FIXED: Handle filter changes with proper logging and URL updates
  const handleFilterChange = (filterName, value) => {
    console.log(`Filter change: ${filterName} = ${value}`);
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: value
      };
      
      console.log('Updated filters:', newFilters);
      
      // Update URL parameters to reflect filter changes
      const searchParams = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, val]) => {
        if (val && val !== false && val !== '' && key !== 'userCity') {
          searchParams.set(key, val.toString());
        }
      });
      
      const newSearch = searchParams.toString();
      if (newSearch !== location.search.replace('?', '')) {
        navigate(`/doctors?${newSearch}`, { replace: true });
      }
      
      return newFilters;
    });
    
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle sort change
  const handleSortChange = (sortField, order) => {
    setSortBy(sortField);
    setSortOrder(order);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      specialization: '',
      city: '',
      minRating: '',
      maxFee: '',
      minFee: '',
      experience: '',
      showLocalOnly: false,
      userCity: '',
      search: ''
    };
    setFilters(clearedFilters);
    
    // Clear URL parameters as well
    navigate('/doctors', { replace: true });
  };

  // Show more doctors in a specific specialization
  const showMoreDoctors = (specialization) => {
    setShowMoreStates(prev => ({
      ...prev,
      [specialization]: prev[specialization] + 10
    }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.currentPage || loading) {
      return;
    }

    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchDoctors(page);
  };

  const getPaginationPages = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const pages = [];

    if (total <= 7) {
      for (let page = 1; page <= total; page += 1) pages.push(page);
      return pages;
    }

    pages.push(1);
    if (current > 4) pages.push('start-ellipsis');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let page = start; page <= end; page += 1) pages.push(page);

    if (current < total - 3) pages.push('end-ellipsis');
    pages.push(total);
    return pages;
  };

  // Navigate to doctor profile
  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  // Scroll to specialization section
  const scrollToSpecialization = (specialization) => {
    const element = document.getElementById(`specialization-${specialization}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // FIXED: Initial load - wait for user location to be loaded before fetching
  useEffect(() => {
    if (userLocationLoaded) {
      console.log('User location loaded, fetching doctors...');
      fetchDoctors();
    }
  }, [userLocationLoaded]);

  // FIXED: Filter updates - fetch doctors when filters change (but only after user location is loaded)
  useEffect(() => {
    if (userLocationLoaded) {
      console.log('Filters changed, refetching doctors...');
      fetchDoctors();
    }
  }, [filters, sortBy, sortOrder]);

  // Specialization display names
  const specializationNames = {
    'cardiology': 'Cardiologists',
    'dermatology': 'Dermatologists',
    'neurology': 'Neurologists',
    'pediatrics': 'Pediatricians',
    'orthopedics': 'Orthopedic Surgeons',
    'psychiatry': 'Psychiatrists',
    'general': 'General Practitioners',
    'gynecology': 'Gynecologists',
    'ophthalmology': 'Ophthalmologists',
    'dentistry': 'Dentists',
    'other': 'Other Specialists'
  };

  // Show loading spinner only if user location is not loaded yet or doctors are loading for the first time
  if (!userLocationLoaded || (!hasLoadedDoctors && loading)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="doctors-page">
      <div className="container">
        {/* Header */}
        <div className="page-header doctors-hero">
          <div className="doctors-hero__content">
            <span className="doctors-hero__eyebrow">
              <i className="fas fa-stethoscope"></i>
              MediCare Network
            </span>
            <h1>Find the Right Doctor for You</h1>
            <p>Search by specialty, city, rating, experience, and consultation fee.</p>
            <div className="doctors-hero__actions">
              <button className="doctors-hero__button doctors-hero__button--primary" onClick={() => navigate('/doctors')}>
                <i className="fas fa-user-md"></i>
                Explore Doctors
              </button>
              <button className="doctors-hero__button doctors-hero__button--ghost" onClick={clearFilters}>
                <i className="fas fa-sliders"></i>
                Reset Filters
              </button>
            </div>
          </div>

          <div className="doctors-hero__visual" aria-hidden="true">
            <div className="hero-orbit hero-orbit--one"></div>
            <div className="hero-orbit hero-orbit--two"></div>
            <div className="hero-pulse-card">
              <i className="fas fa-heartbeat"></i>
              <span>Live Care</span>
            </div>
            <div className="hero-floating-chip hero-floating-chip--top">Verified</div>
            <div className="hero-floating-chip hero-floating-chip--bottom">Book Fast</div>
          </div>
          
          {/* Search Results Info */}
          {filters.search && (
            <div className="doctors-context-card">
              <strong>Search Results for:</strong> "{filters.search}"
              {pagination.totalDoctors > 0 && (
                <span> - {pagination.totalDoctors} doctors found</span>
              )}
            </div>
          )}
          
          {/* User Location Debug Info */}
          {userLocation && userLocation.city && (
            <div className="doctors-context-card">
              <strong>Your Location:</strong> {userLocation.city}, {userLocation.state}
            </div>
          )}

          {/* Show message if user has no location */}
          {userLocationLoaded && (!userLocation || !userLocation.city) && (
            <div className="doctors-context-card doctors-context-card--warning">
              <strong>Note:</strong> Add your city to your profile to use the "Local Doctors" filter.
            </div>
          )}
        </div>

        <div className="page-content">
          {/* Sidebar */}
          <aside className="sidebar">
            <FilterSidebar
              filters={filters}
              filterOptions={filterOptions}
              userLocation={userLocation}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              onClearFilters={clearFilters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              backendUrl={backendUrl}
            />
          </aside>

          {/* Main Content */}
          <main className={`main-content ${loading ? 'is-updating' : ''}`}>
            {loading && hasLoadedDoctors && (
              <div className="doctors-updating-indicator">
                <i className="fas fa-spinner fa-spin"></i>
                Updating results
              </div>
            )}
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => fetchDoctors()}>Try Again</button>
              </div>
            )}

            {!error && doctors.length === 0 && !loading && (
              <div className="no-results">
                <h3>No doctors found</h3>
                <p>Try adjusting your filters or search criteria</p>
                {filters.search && (
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    No results for search: "{filters.search}"
                  </p>
                )}
                {filters.showLocalOnly && userLocation && userLocation.city && (
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Looking for doctors in: {userLocation.city}
                  </p>
                )}
                {filters.showLocalOnly && (!userLocation || !userLocation.city) && (
                  <p style={{ color: '#d32f2f', fontSize: '14px' }}>
                    Please add your city to your profile to use local filter.
                  </p>
                )}
                <button onClick={clearFilters}>Clear Filters</button>
              </div>
            )}

            {!error && doctors.length > 0 && (
              <>
                {/* Active Filters */}
                {(filters.specialization || filters.city || filters.minRating || filters.maxFee || filters.minFee || filters.experience || filters.showLocalOnly || filters.search) && (
                  <div className="active-filters">
                    <h4>Active Filters:</h4>
                    <div className="filter-tags">
                      {filters.search && (
                        <span className="filter-tag">
                          Search: {filters.search}
                          <button onClick={() => handleFilterChange('search', '')}>×</button>
                        </span>
                      )}
                      {filters.specialization && (
                        <span className="filter-tag">
                          Specialty: {filters.specialization}
                          <button onClick={() => handleFilterChange('specialization', '')}>×</button>
                        </span>
                      )}
                      {filters.city && (
                        <span className="filter-tag">
                          City: {filters.city}
                          <button onClick={() => handleFilterChange('city', '')}>×</button>
                        </span>
                      )}
                      {filters.minRating && (
                        <span className="filter-tag">
                          Min Rating: {filters.minRating}+
                          <button onClick={() => handleFilterChange('minRating', '')}>×</button>
                        </span>
                      )}
                      {filters.maxFee && (
                        <span className="filter-tag">
                          Max Fee: ₹{filters.maxFee}
                          <button onClick={() => handleFilterChange('maxFee', '')}>×</button>
                        </span>
                      )}
                      {filters.minFee && (
                        <span className="filter-tag">
                          Min Fee: ₹{filters.minFee}
                          <button onClick={() => handleFilterChange('minFee', '')}>×</button>
                        </span>
                      )}
                      {filters.experience && (
                        <span className="filter-tag">
                          Experience: {filters.experience}+ years
                          <button onClick={() => handleFilterChange('experience', '')}>×</button>
                        </span>
                      )}
                      {filters.showLocalOnly && (
                        <span className="filter-tag">
                          Local Only ({userLocation?.city || 'No city set'})
                          <button onClick={() => handleFilterChange('showLocalOnly', false)}>×</button>
                        </span>
                      )}
                      <button className="clear-all-btn" onClick={clearFilters}>
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* Doctors by Specialization */}
                {Object.keys(groupedDoctors).map(specialization => {
                  const doctorsInSpec = groupedDoctors[specialization];
                  const visibleCount = showMoreStates[specialization] || 10;
                  const visibleDoctors = doctorsInSpec.slice(0, visibleCount);
                  const hasMore = doctorsInSpec.length > visibleCount;

                  return (
                    <section key={specialization} className="specialization-section" id={`specialization-${specialization}`}>
                      <div className="section-header">
                        <h2>{specializationNames[specialization] || `${specialization} Specialists`}</h2>
                        <span className="doctor-count">{doctorsInSpec.length} doctors</span>
                      </div>

                      <div className={`doctors-grid ${visibleDoctors.length === 1 ? 'doctors-grid--single' : ''}`}>
                        {visibleDoctors.map(doctor => (
                          <DoctorCard
                            key={doctor._id}
                            doctor={doctor}
                            onClick={() => handleDoctorClick(doctor._id)}
                            userLocation={userLocation}
                          />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="show-more-container">
                          <button
                            className="show-more-btn"
                            onClick={() => showMoreDoctors(specialization)}
                          >
                            Show More ({doctorsInSpec.length - visibleCount} more)
                          </button>
                        </div>
                      )}
                    </section>
                  );
                })}

                {pagination.totalPages > 1 && (
                  <nav className="doctors-pagination" aria-label="Doctors pagination">
                    <button
                      className="pagination-btn pagination-btn--nav"
                      onClick={() => goToPage(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage || loading}
                    >
                      <i className="fas fa-chevron-left"></i>
                      Previous
                    </button>

                    <div className="pagination-pages">
                      {getPaginationPages().map((page) => (
                        typeof page === 'number' ? (
                          <button
                            key={page}
                            className={`pagination-btn pagination-btn--page ${page === pagination.currentPage ? 'active' : ''}`}
                            onClick={() => goToPage(page)}
                            disabled={loading}
                            aria-current={page === pagination.currentPage ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={page} className="pagination-ellipsis">...</span>
                        )
                      ))}
                    </div>

                    <button
                      className="pagination-btn pagination-btn--nav"
                      onClick={() => goToPage(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
