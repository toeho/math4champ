import { useState, useCallback } from 'react';
import { showNotification } from '../utils/parentErrorHandler';

/**
 * Custom hook for managing async operations with loading and error states
 * @param {Function} asyncFunction - Async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} State and execute function
 */
export function useParentAsync(asyncFunction, options = {}) {
  const {
    onSuccess = null,
    onError = null,
    showSuccessNotification = false,
    successMessage = 'Operation completed successfully',
    showErrorNotification = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);

      if (showSuccessNotification) {
        showNotification(successMessage, 'success', 3000);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      setError(err);

      if (showErrorNotification) {
        const errorMessage = err.message || 'An error occurred';
        showNotification(errorMessage, 'error', 5000);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError, showSuccessNotification, successMessage, showErrorNotification]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

/**
 * Custom hook for managing form submission with loading and error states
 * @param {Function} submitFunction - Form submission function
 * @param {Object} options - Configuration options
 * @returns {Object} State and submit function
 */
export function useParentFormSubmit(submitFunction, options = {}) {
  const {
    onSuccess = null,
    successMessage = 'Form submitted successfully',
    resetOnSuccess = false,
  } = options;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submit = useCallback(async (formData) => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const result = await submitFunction(formData);
      setSubmitSuccess(true);
      
      showNotification(successMessage, 'success', 3000);

      if (onSuccess) {
        onSuccess(result);
      }

      if (resetOnSuccess) {
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      }

      return result;
    } catch (err) {
      setSubmitError(err);
      const errorMessage = err.message || 'Form submission failed';
      showNotification(errorMessage, 'error', 5000);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [submitFunction, onSuccess, successMessage, resetOnSuccess]);

  const reset = useCallback(() => {
    setSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    submitting,
    submitError,
    submitSuccess,
    submit,
    reset,
  };
}

/**
 * Custom hook for managing data fetching with loading and error states
 * @param {Function} fetchFunction - Data fetching function
 * @param {Object} options - Configuration options
 * @returns {Object} State and refetch function
 */
export function useParentFetch(fetchFunction, options = {}) {
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
  } = options;

  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(...args);
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      setError(err);

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, onSuccess, onError]);

  const refetch = useCallback(() => {
    setRefetchCount(prev => prev + 1);
    return fetch();
  }, [fetch]);

  return {
    loading,
    error,
    data,
    fetch,
    refetch,
    refetchCount,
  };
}
