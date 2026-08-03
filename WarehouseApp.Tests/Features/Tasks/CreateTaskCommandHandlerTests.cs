using Microsoft.EntityFrameworkCore;
using Moq;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.Features.Tasks.Commands;
using WarehouseApp.Domain.Enums;
using WarehouseApp.Infrastructure.Persistence;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;


namespace WarehouseApp.Tests.Features.Tasks;

public class CreateTaskCommandHandlerTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Handle_WithAssignedWorker_CreatesTaskAssignment()
    {
        // Arrange
        var context = CreateContext();
        var notificationService = new Mock<INotificationService>();
        var handler = new CreateTaskCommandHandler(context, notificationService.Object);

        var workerId = "worker-123";

        var command = new CreateTaskCommand(
            Title: "Assign Me",
            Description: null,
            Priority: TaskPriority.Low,
            DueDate: null,
            SectorId: Guid.NewGuid(),
            AssignedToId: workerId,
            CreatedById: "user-1"
        );

        // Act
        var taskId = await handler.Handle(command, CancellationToken.None);

        // Assert
        var assignment = context.TaskAssignments
            .FirstOrDefault(a => a.WarehouseTaskId == taskId);

        Assert.NotNull(assignment);
        Assert.Equal(workerId, assignment.UserId);
    }

    [Fact]
    public async Task Handle_CreatesTask_WithTodoStatus()
    {
        // Arrange
        var context = CreateContext();
        var notificationService = new Mock<INotificationService>();
        var handler = new CreateTaskCommandHandler(context, notificationService.Object);

        var command = new CreateTaskCommand(
            Title: "Test Task",
            Description: null,
            Priority: TaskPriority.Medium,
            DueDate: null,
            SectorId: Guid.NewGuid(),
            AssignedToId: null,
            CreatedById: "user-1"
        );

        // Act
        var taskId = await handler.Handle(command, CancellationToken.None);

        // Assert
        var saved = await context.WarehouseTasks.FindAsync(taskId);
        Assert.NotNull(saved);
        Assert.Equal(TaskStatus.Todo, saved.Status);
    }

    [Fact]
    public async Task Handle_WithNoAssignedWorker_DoesNotCreateTaskAssignment()
    {
        // Arrange
        var context = CreateContext();
        var notificationService = new Mock<INotificationService>();
        var handler = new CreateTaskCommandHandler(context, notificationService.Object);

        var command = new CreateTaskCommand(
            Title: "No Worker",
            Description: null,
            Priority: TaskPriority.Low,
            DueDate: null,
            SectorId: Guid.NewGuid(),
            AssignedToId: null,
            CreatedById: "user-1"
        );

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Empty(context.TaskAssignments);
    }

    [Fact]
    public async Task Handle_WithAssignedWorker_SendsNotificationToWorker()
    {
        // Arrange
        var context = CreateContext();
        var notificationService = new Mock<INotificationService>();
        var handler = new CreateTaskCommandHandler(context, notificationService.Object);

        var workerId = "worker-123";

        var command = new CreateTaskCommand(
            Title: "Notify Me",
            Description: null,
            Priority: TaskPriority.Medium,
            DueDate: null,
            SectorId: Guid.NewGuid(),
            AssignedToId: workerId,
            CreatedById: "user-1"
        );

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        notificationService.Verify(
            n => n.SendToUserAsync(workerId, It.IsAny<string>(), "TaskAssigned", It.IsAny<string>()),
            Times.Once
        );
    }
}