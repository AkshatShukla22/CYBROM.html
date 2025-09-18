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
  const fetchDoctors = async (page = 1, isLoadMore = false) => {
    try {
      setLoading(!isLoadMore);
      
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
        if (isLoadMore) {
          setDoctors(prev => [...prev, ...data.data.doctors]);
        } else {
          setDoctors(data.data.doctors);
          setFilterOptions(data.data.filters);
        }
        setPagination(data.data.pagination);
        
        // Group doctors by specialization
        groupDoctorsBySpecialization(isLoadMore ? [...doctors, ...data.data.doctors] : data.data.doctors);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch doctors');
      console.error('Fetch doctors error:', err);
    } finally {
      setLoading(false);
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

  // Load more doctors (pagination)
  const loadMoreDoctors = () => {
    if (pagination.hasNextPage) {
      fetchDoctors(pagination.currentPage + 1, true);
    }
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

  // Check if we should scroll to a specific specialization after loading
  useEffect(() => {
    if (!loading && filters.specialization && doctors.length > 0) {
      // Delay scroll to ensure DOM is updated
      setTimeout(() => {
        scrollToSpecialization(filters.specialization);
      }, 100);
    }
  }, [loading, filters.specialization, doctors]);

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
  if (!userLocationLoaded || (loading && doctors.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="doctors-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Find the Right Doctor for You</h1>
          <p>Browse through our network of qualified healthcare professionals</p>
          
          {/* Search Results Info */}
          {filters.search && (
            <div style={{ 
              background: '#e3f2fd', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '5px',
              fontSize: '14px' 
            }}>
              <strong>Search Results for:</strong> "{filters.search}"
              {pagination.totalDoctors > 0 && (
                <span> - {pagination.totalDoctors} doctors found</span>
              )}
            </div>
          )}
          
          {/* User Location Debug Info */}
          {userLocation && userLocation.city && (
            <div style={{ 
              background: '#f0f8ff', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '5px',
              fontSize: '14px' 
            }}>
              <strong>Your Location:</strong> {userLocation.city}, {userLocation.state}
            </div>
          )}

          {/* Show message if user has no location */}
          {userLocationLoaded && (!userLocation || !userLocation.city) && (
            <div style={{ 
              background: '#fff3cd', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '5px',
              fontSize: '14px',
              color: '#856404'
            }}>
              <strong>Note:</strong> Add your city to your profile to use the "Local Doctors" filter.
            </div>
          )}
          
          {/* Stats */}
          <div className="stats-bar">
            <div className="stat">
              <span className="number">{pagination.totalDoctors}</span>
              <span className="label">Doctors Available</span>
            </div>
            <div className="stat">
              <span className="number">{Object.keys(groupedDoctors).length}</span>
              <span className="label">Specializations</span>
            </div>
            <div className="stat">
              <span className="number">{filterOptions.cities.length}</span>
              <span className="label">Cities</span>
            </div>
          </div>
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
          <main className="main-content">
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

                      <div className="doctors-grid">
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

                {/* Load More (Global Pagination) */}
                {pagination.hasNextPage && (
                  <div className="load-more-container">
                    <button
                      className="load-more-btn"
                      onClick={loadMoreDoctors}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Doctors'}
                    </button>
                  </div>
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