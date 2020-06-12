register(({ users }) => {
  // Possibly serial execution

  // No mutation!!!
  const count = Object.entries(users).filter(([k, v]) => v.name.length > 100)
    .length;
  return { longNameCount: count % 100 };
});

register(({ users: { '*': { key, name } } }) => {
  // Parallel execution

  console.log(name);

  return { users: { [key]: { bla: 123 } } };
});

register(({ myState, messages: [first, ...rest] }) => {
  // Message queue

  const { a, b } = first;
  myState = reduce(myState, a, b);

  return { myState, messages: rest };
});

// An "immediate reducer" runs directly (in the same transaction) as the previous one. If it fails, the previous one fails.
// The root of the tree allows access from every role.
// Nodes with the "roles" property restrict this.
// All objects have these properties:
//   key
//   roles
//   owner
//   createdTime
