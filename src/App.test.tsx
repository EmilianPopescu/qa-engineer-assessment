import * as React from 'react';
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import App from './App';
import '@testing-library/jest-dom'; 

// reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// clean up after each test
afterEach(() => {
  cleanup();
});

it('Toggling Todo Items', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  render(<App />, { container: document.getElementById('root') });

  const todoCheckboxes = screen.getAllByRole('checkbox');
  expect(todoCheckboxes.length).toBeGreaterThan(0); // make sure checkboxes are present

  const errors: string[] = [];

  todoCheckboxes.forEach((checkbox, index) => {
    try {
      expect((checkbox as HTMLInputElement).checked).toBe(false); // should start unchecked
      fireEvent.click(checkbox); // toggle
      expect((checkbox as HTMLInputElement).checked).toBe(true); // should be checked now
    } catch (error) {
      errors.push(`Error on checkbox ${index + 1}: ${error.message}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
});
