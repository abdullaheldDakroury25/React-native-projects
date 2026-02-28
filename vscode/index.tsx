// Import necessary React hooks and React Native components
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,     // Component to handle safe area boundaries (notches, status bars)
  StyleSheet,        // API for creating optimized stylesheets
  Text,              // Component for displaying text
  TextInput,         // Component for capturing user input
  TouchableOpacity,  // Touchable component with opacity feedback on press
  FlatList,          // Efficient list rendering component
  View,              // Basic container component for layout
  StatusBar,         // Component to control the device status bar
  Platform,          // Detects platform (iOS/Android/Web) for conditional styling
} from 'react-native';

// Main App component - Entry point of the application
const App = () => {
  // ===== STATE VARIABLES =====
  
  // Stores all todo items with their properties
  // Each todo: { id: string, title: string, completed: boolean }
  const [todos, setTodos] = useState([
    { id: '1', title: 'wash dishes', completed: false },
    { id: '2', title: 'edit-resume', completed: false },
    { id: '3', title: 'finish Codedex course', completed: false },
    { id: '4', title: 'Then sleep', completed: false },
  ]);
  
  // Stores the current text in the input field for new tasks
  const [inputText, setInputText] = useState('');
  
  // Tracks which task is currently being edited (null if none)
  const [editingId, setEditingId] = useState(null);
  
  // Stores the temporary text during edit operations
  const [editText, setEditText] = useState('');
  
  // Controls which tasks are displayed: 'all', 'completed', or 'uncompleted'
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'uncompleted'

  // ===== TASK OPERATION FUNCTIONS =====

  /**
   * Adds a new task to the todo list
   * Validates input, creates new task object, adds to beginning of list
   * Clears input field after successful addition
   */
  const addTodo = () => {
    // Prevent adding empty tasks (trim removes whitespace)
    if (inputText.trim().length === 0) return;

    // Create new task object with unique ID (timestamp) and default completed false
    const newTodo = {
      id: Date.now().toString(),  // Unique ID using current timestamp
      title: inputText,            // Task description from input
      completed: false,            // New tasks start as incomplete
    };

    // Update todos state: add new task to the beginning of the array
    setTodos(prevTodos => [newTodo, ...prevTodos]);
    
    // Clear the input field for next entry
    setInputText('');
  };

  /**
   * Toggles the completion status of a task
   * @param {string} id - The ID of the task to toggle
   */
  const toggleTodo = id => {
    // Map through all tasks and flip completed status for the matching task
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  /**
   * Deletes a task from the todo list
   * @param {string} id - The ID of the task to delete
   * Also cleans up edit mode if the deleted task was being edited
   */
  const deleteTodo = id => {
    // Filter out the task with matching ID
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    
    // If the deleted task was being edited, clear edit state
    if (editingId === id) {
      setEditingId(null);
      setEditText('');
    }
  };

  /**
   * Initiates edit mode for a specific task
   * @param {string} id - The ID of the task to edit
   * @param {string} title - The current title of the task
   */
  const startEditing = (id, title) => {
    setEditingId(id);      // Set which task is being edited
    setEditText(title);    // Pre-fill edit field with current title
  };

  /**
   * Saves the edited task title
   * Validates input and updates the task in the todos array
   */
  const saveEdit = () => {
    // Prevent saving empty task titles
    if (editText.trim().length === 0) return;
    
    // Update the title of the task being edited
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === editingId ? { ...todo, title: editText } : todo
      )
    );
    
    // Exit edit mode and clear edit text
    setEditingId(null);
    setEditText('');
  };

  /**
   * Cancels edit mode without saving changes
   */
  const cancelEdit = () => {
    setEditingId(null);    // Exit edit mode
    setEditText('');       // Clear edit text
  };

  // ===== HELPER FUNCTIONS =====

  /**
   * Calculates task statistics
   * @returns {Object} Object containing total, completed, and uncompleted counts
   */
  const getStats = () => {
    const total = todos.length;                                   // Total number of tasks
    const completed = todos.filter(t => t.completed).length;     // Count of completed tasks
    const uncompleted = total - completed;                        // Count of pending tasks
    return { total, completed, uncompleted };
  };

  /**
   * Filters tasks based on selected filter
   * @returns {Array} Filtered array of todos
   */
  const getFilteredTodos = () => {
    switch (filter) {
      case 'completed':    // Return only completed tasks
        return todos.filter(todo => todo.completed);
      case 'uncompleted':  // Return only uncompleted tasks
        return todos.filter(todo => !todo.completed);
      default:             // Return all tasks (default)
        return todos;
    }
  };

  // Calculate stats and filtered todos (these run on every render)
  const stats = getStats();
  const filteredTodos = getFilteredTodos();

  // ===== COMPONENT FOR RENDERING INDIVIDUAL TODO ITEMS =====

  /**
   * Renders a single todo item
   * @param {Object} props - Component props
   * @param {Object} props.item - The todo item to render
   * @param {number} props.index - Index of the item in the list
   */
  const TodoItem = ({ item, index }) => {
    // If this task is currently being edited, show edit mode UI
    if (editingId === item.id) {
      return (
        <View style={styles.todoItem}>
          <View style={styles.editContainer}>
            {/* Edit input field */}
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}  // Update editText as user types
              autoFocus                     // Automatically focus input
              onSubmitEditing={saveEdit}    // Save on submit (Enter key)
              returnKeyType="done"          // Show "Done" button on keyboard
            />
            {/* Edit action buttons */}
            <View style={styles.editActions}>
              {/* Save button - green */}
              <TouchableOpacity onPress={saveEdit} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              {/* Cancel button - gray */}
              <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Normal view mode (not editing)
    return (
      <View style={styles.todoItem}>
        {/* Left section: checkbox and task text */}
        <View style={styles.todoContent}>
          {/* Checkbox - toggles completion status */}
          <TouchableOpacity
            style={[styles.checkbox, item.completed && styles.checked]}
            onPress={() => toggleTodo(item.id)}>
            {/* Show checkmark if completed */}
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          
          {/* Task text - strikethrough if completed */}
          <Text style={[styles.todoText, item.completed && styles.completedText]}>
            {item.title}
          </Text>
        </View>
        
        {/* Right section: action buttons */}
        <View style={styles.actionButtons}>
          {/* Edit button - yellow */}
          <TouchableOpacity
            onPress={() => startEditing(item.id, item.title)}
            style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          {/* Delete button - red */}
          <TouchableOpacity
            onPress={() => deleteTodo(item.id)}
            style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ===== MAIN RENDER FUNCTION =====

  return (
    // SafeAreaView ensures content is within safe screen boundaries
    <SafeAreaView style={styles.container}>
      {/* StatusBar configuration */}
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.title}>Task Manager "To-do-list"</Text>
        <Text style={styles.subtitle}>Organize your daily tasks</Text>
      </View>

      {/* STATISTICS CARDS SECTION */}
      <View style={styles.statsContainer}>
        {/* Total tasks card */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        {/* Pending tasks card - orange tint */}
        <View style={[styles.statCard, styles.pendingCard]}>
          <Text style={styles.statNumber}>{stats.uncompleted}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        {/* Completed tasks card - green tint */}
        <View style={[styles.statCard, styles.completedCard]}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      {/* FILTER BUTTONS SECTION */}
      <View style={styles.filterContainer}>
        {/* All filter button */}
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All ({stats.total})
          </Text>
        </TouchableOpacity>
        {/* Completed filter button */}
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}>
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Completed ({stats.completed})
          </Text>
        </TouchableOpacity>
        {/* Uncompleted filter button */}
        <TouchableOpacity
          style={[styles.filterButton, filter === 'uncompleted' && styles.activeFilter]}
          onPress={() => setFilter('uncompleted')}>
          <Text style={[styles.filterText, filter === 'uncompleted' && styles.activeFilterText]}>
            Uncompleted ({stats.uncompleted})
          </Text>
        </TouchableOpacity>
      </View>

      {/* INPUT SECTION - for adding new tasks */}
      <View style={styles.inputSection}>
        {/* Multi-line text input for task description */}
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Write your task here..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}    // Update inputText as user types
            multiline={true}                // Allow multiple lines
            numberOfLines={3}               // Show 3 lines by default
            textAlignVertical="top"          // Align text to top
          />
        </View>
        
        {/* Add Task button - disabled when input is empty */}
        <TouchableOpacity
          style={[styles.addButton, !inputText.trim() && styles.addButtonDisabled]}
          onPress={addTodo}                  // Call addTodo on press
          disabled={!inputText.trim()}       // Disable if input is empty
          activeOpacity={0.7}>               // Opacity when pressed
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* TASK LIST HEADER */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Task List ({filteredTodos.length})</Text>
      </View>

      {/* TODO LIST - Conditional rendering based on filtered tasks */}
      {filteredTodos.length > 0 ? (
        // Render FlatList if there are tasks
        <FlatList
          data={filteredTodos}                      // Data source
          keyExtractor={item => item.id}            // Unique key for each item
          renderItem={({ item, index }) => <TodoItem item={item} index={index} />}
          contentContainerStyle={styles.listContainer} // Style for the list container
          showsVerticalScrollIndicator={false}       // Hide scroll indicator
        />
      ) : (
        // Show empty state message if no tasks match filter
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No tasks found</Text>
          <Text style={styles.emptyStateSubtext}>
            {/* Contextual message based on current filter */}
            {filter === 'completed' 
              ? "You haven't completed any tasks yet" 
              : filter === 'uncompleted'
              ? 'All tasks are completed!'
              : 'Add your first task above'}
          </Text>
        </View>
      )}

      {/* SUMMARY SECTION - Footer with task counts */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Completed: {stats.completed} | Uncompleted: {stats.uncompleted}
        </Text>
      </View>
    </SafeAreaView>
  );
};

// ===== STYLESHEET =====
// All styling rules for the application
const styles = StyleSheet.create({
  // Main container - centers content and adds max width
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      },
    }),
  },
  // Header section styling
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  // Main title styling
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  // Subtitle styling
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  // Statistics cards container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  // Individual stat card styling
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  // Pending card background color
  pendingCard: {
    backgroundColor: '#fff3e0',
  },
  // Completed card background color
  completedCard: {
    backgroundColor: '#e8f5e8',
  },
  // Stat number styling
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // Stat label styling
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // Filter buttons container
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  // Individual filter button styling
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  // Active filter button styling
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  // Filter text styling
  filterText: {
    color: '#333',
    fontWeight: '500',
  },
  // Active filter text styling
  activeFilterText: {
    color: '#fff',
  },
  // Input section container
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  // Text area container
  textAreaContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  // Text input styling
  textArea: {
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    color: '#333',
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outline: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
    }),
  },
  // Add button styling
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0,122,255,0.3)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 8px rgba(0,122,255,0.4)',
        },
      },
      default: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  // Disabled add button styling
  addButtonDisabled: {
    backgroundColor: '#b0b0b0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'not-allowed',
      },
    }),
  },
  // Add button text styling
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // List header styling
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  // List header text styling
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  // List container styling
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  // Individual todo item styling
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  // Todo content container (left side)
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  // Checkbox styling
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  // Checked state styling
  checked: {
    backgroundColor: '#007AFF',
  },
  // Checkmark styling
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Todo text styling
  todoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  // Completed text styling (strikethrough)
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  // Action buttons container (right side)
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Edit button styling
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffc107',
    borderRadius: 6,
    marginRight: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  // Edit button text
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  // Delete button styling
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  // Delete button text
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  // Edit container styling (during edit mode)
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Edit input styling
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    ...Platform.select({
      web: {
        outline: 'none',
      },
    }),
  },
  // Edit actions container
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  // Save button styling
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#28a745',
    borderRadius: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  // Save button text
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  // Cancel button styling
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6c757d',
    borderRadius: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  // Cancel button text
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  // Empty state container
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  // Empty state main text
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  // Empty state subtext
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Summary footer styling
  summary: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  // Summary text styling
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

// Export the App component as default
export default App;