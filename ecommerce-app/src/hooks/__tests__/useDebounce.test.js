import { renderHook, act } from '@testing-library/react';
import useDebounce from '../useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should update value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });

    // Should still be initial before delay
    expect(result.current).toBe('initial');

    // Fast-forward 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should cancel previous timer if value changes again', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Change value
    rerender({ value: 'update1', delay: 500 });
    
    // Fast-forward 250ms
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Change value again
    rerender({ value: 'update2', delay: 500 });

    // Fast-forward another 250ms (total 500ms since start, but only 250ms since update2)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Should still be initial or update1? No, should be initial because update1 was cancelled.
    expect(result.current).toBe('initial');

    // Fast-forward another 250ms (total 500ms since update2)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe('update2');
  });
});
