using MediatR;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;


namespace WarehouseApp.Application.Features.Messages.Commands;

public record SendMessageCommand(string SenderId, string ReceiverId, string Content) : IRequest<Guid>;
    public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Guid>
    {
        private readonly IAppDbContext _context;
        private readonly INotificationService _notificationService;
        public SendMessageCommandHandler(IAppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }
public async Task<Guid> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            SenderId = request.SenderId,
            ReceiverId = request.ReceiverId,
            Content = request.Content,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };
        _context.Messages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);
        await _notificationService.SendToUserAsync(
            request.ReceiverId,
            $"New message from {request.SenderId}",
            "NewMessage"
        );
        return message.Id;
    }
    }
