using MediatR;
using WarehouseApp.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Comment = WarehouseApp.Domain.Entities.Comment;
namespace WarehouseApp.Application.Features.Comments.Commands;
 public record AddCommentCommand(Guid TaskId, string Content, string AuthorId) : IRequest<Guid>;
    public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, Guid>
    {
        private readonly IAppDbContext _context;
        private readonly INotificationService _notificationService;
        public AddCommentCommandHandler(IAppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }
        public async Task<Guid> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            Content = request.Content,
            AuthorId = request.AuthorId,
            CreatedAt = DateTime.UtcNow,
            TaskId = request.TaskId
        };
        await _context.Comments.AddAsync(comment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        var task = await _context.WarehouseTasks
            .Include(t => t.TaskAssignments)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task is not null)
        {
            foreach (var assignment in task.TaskAssignments.Where(a => a.UserId != request.AuthorId))
            {
                await _notificationService.SendToUserAsync(
                    assignment.UserId,
                    $"New comment on your task: {task.Title}",
                    "NewComment"
                );
            }
        }
        return comment.Id;
    }
    }
