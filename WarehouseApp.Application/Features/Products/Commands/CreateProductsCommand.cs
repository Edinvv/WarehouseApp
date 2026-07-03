using MediatR;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Application.Features.Products.Commands;

    public record CreateProductCommand(string Name, int Quantity , int MinimumQuantity, Guid SectorId) : IRequest<Guid>;
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
    {
         private readonly IAppDbContext _context;
        public CreateProductCommandHandler(IAppDbContext context)
        {
            _context = context;
        }
        public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken){
            
            var product = new Product
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Quantity = request.Quantity,
                MinimumQuantity = request.MinimumQuantity,
                SectorId = request.SectorId
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);

            return product.Id;
        }
    }
