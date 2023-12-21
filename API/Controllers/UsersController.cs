using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

namespace API.Controllers
{
    [Authorize]
    public class UsersController: BaseApiController
    {
        private readonly IUnitOfWork _unitOfWork;
        
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        public UsersController(IMapper mapper, IPhotoService photoService, IUnitOfWork unitOfWork)
        {      
            _unitOfWork = unitOfWork;
            _photoService = photoService;      
            _mapper = mapper;            
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<PagedList<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
        {
            //This one uses GetUsersAsync
        //    var users = await _userRepository.GetUserAsync();  

        //    var usersToReturn = _mapper.Map<IEnumerable<MemberDto>>(users); 

        //    return Ok(usersToReturn); 
            //  This one uses GetMembersAsync
               var gender = await _unitOfWork.UserRepository.GetUserGender(User.GetUsername());
               userParams.CurrentUsername = User.GetUsername();

               if(string.IsNullOrEmpty(userParams.Gender))               
                    userParams.Gender = gender == "male" ? "female" : "male";               

               var users = await _unitOfWork.UserRepository.GetMembersAsync(userParams); 

               Response.AddPaginationHeader(new PaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages));

                return Ok(users);

        }
        
        //[Authorize(Roles = "Member")]
        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            //GetMemberAsync
            return await _unitOfWork.UserRepository.GetMemberAsync(username);

            //This one is using GetUsernameAsync
           //var user = await _userRepository.GetUserByUsernameAsync(username);

          // return _mapper.Map<MemberDto>(user);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            //var username = User.GetUsername();
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());

            if(user == null) return NotFound();

            _mapper.Map(memberUpdateDto, user);

            if(await _unitOfWork.Complete()) return NoContent();

            return BadRequest("Failed to update user");
        }

        [HttpPost("add-Photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());

            if(user == null) return NotFound();

            var result = await _photoService.AddPhotoAsync(file);

            if(result.Error != null) return BadRequest(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                publicId = result.PublicId
            };

            if(user.Photos.Count == 0) photo.IsMain = true;

            user.Photos.Add(photo);

            if ( await _unitOfWork.Complete()) 
            {
                return CreatedAtAction(nameof(GetUser), 
                    new {username = user.UserName}, _mapper.Map<PhotoDto>(photo));
            }

            return BadRequest("Problem adding photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());

            if(user == null) return NotFound();

            var photo = user.Photos.FirstOrDefault( x => x.Id == photoId);

            if(photo == null) return NotFound();

            if(photo.IsMain) return BadRequest("this is already your main photo");

            var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
            if (currentMain != null) currentMain.IsMain = false;
            photo.IsMain = true;

            if(await _unitOfWork.Complete()) return NoContent();

            return BadRequest("Problem setting the main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            if(photo == null) return NotFound();

            if(photo.IsMain) return BadRequest("You cannot delete your main photo");

            if(photo.publicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(photo.publicId);
                if(result.Error != null) return BadRequest(result.Error.Message);
            }

            user.Photos.Remove(photo);

            if(await _unitOfWork.Complete()) return Ok(); 

            return BadRequest("Problem deleting photo");
        }
    }
}