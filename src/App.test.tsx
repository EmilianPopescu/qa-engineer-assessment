import * as React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
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

it("State Persistence", async () => {
  render(<App />);

  // add a new todo
  const input = screen.getByPlaceholderText("Add a new todo item here");
  fireEvent.change(input, { target: { value: "Go to the gym" } });
  fireEvent.submit(input.closest('form')!);

  // wait for the new todo to appear in the list
  await waitFor(() => expect(screen.getByText("Go to the gym")).toBeInTheDocument());

  // check localStorage for the saved todo
  const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
  expect(savedTodos).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ label: "Buy groceries", completed: false }),
    ])
  );

  // simulate a refresh by unmounting and remounting the App
  cleanup();
  render(<App />);
  expect(screen.getByText("Go to the gym")).toBeInTheDocument();
});

it('Auto-Sinking Checked Items', async () => {
  render(<App />);

  const todoItems = screen.getAllByRole('checkbox');
  const initialOrder = todoItems.map(item => 
    item.closest('label')?.querySelector('span')?.textContent
  );

  fireEvent.click(todoItems[0]);

  await waitFor(() => {
    const updatedItems = screen.getAllByRole('checkbox');
    const updatedOrder = updatedItems.map(item => 
      item.closest('label')?.querySelector('span')?.textContent
    );

    expect(updatedOrder.slice(0, -1)).toEqual(initialOrder.slice(1));
    expect(updatedOrder[updatedOrder.length - 1]).toBe(initialOrder[0]);
    expect((updatedItems[updatedItems.length - 1] as HTMLInputElement).checked).toBe(true);
  });
});