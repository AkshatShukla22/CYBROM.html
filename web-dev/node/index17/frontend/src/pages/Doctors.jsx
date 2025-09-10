import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import FilterSidebar from '../components/FilterSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
// import '../styles/Doctors.css';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    minRating: '',
    maxFee: '',
    experience: '',
    showLocalOnly: false
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

  // Get user's location (mock function - you can integrate with geolocation API)
  useEffect(() => {
    // Mock user location - replace with actual geolocation
    const mockUserLocation = 'Delhi';
    setUserLocation(mockUserLocation);
  }, []);

  // Fetch doctors data
  const fetchDoctors = async (page = 1, isLoadMore = false) => {
    try {
      setLoading(!isLoadMore);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([value]) => value && value !== false)
        )
      });

      // Handle local only filter
      if (filters.showLocalOnly && userLocation) {
        queryParams.set('city', userLocation);
      }

      const response = await fetch(`http://localhost:8000/api/doctors?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

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

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
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
    setFilters({
      specialization: '',
      city: '',
      minRating: '',
      maxFee: '',
      experience: '',
      showLocalOnly: false
    });
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

  // Initial load and filter updates
  useEffect(() => {
    fetchDoctors();
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
    'other': 'Other Specialists'
  };

  if (loading && doctors.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="doctors-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Find the Right Doctor for You</h1>
          <p>Browse through our network of qualified healthcare professionals</p>
          
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
                <button onClick={clearFilters}>Clear Filters</button>
              </div>
            )}

            {!error && doctors.length > 0 && (
              <>
                {/* Active Filters */}
                {(filters.specialization || filters.city || filters.minRating || filters.maxFee || filters.experience || filters.showLocalOnly) && (
                  <div className="active-filters">
                    <h4>Active Filters:</h4>
                    <div className="filter-tags">
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
                      {filters.experience && (
                        <span className="filter-tag">
                          Experience: {filters.experience}+ years
                          <button onClick={() => handleFilterChange('experience', '')}>×</button>
                        </span>
                      )}
                      {filters.showLocalOnly && (
                        <span className="filter-tag">
                          Local Only
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
                    <section key={specialization} className="specialization-section">
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