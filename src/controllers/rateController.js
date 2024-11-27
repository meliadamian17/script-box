import prisma from "../utils/db";
import { checkAuth } from "../utils/middleware";

export const ratePost = checkAuth(async (req, res) => {
  const userId = req.user?.userId;
  const { vote, postID } = req.body;

  const post = await prisma.blogPost.findUnique({
    where: { id: parseInt(postID) },
  });

  if (!post) {
    return res.status(404).json({ message: "Post does not exist" });
  }

  const rating = await prisma.blogPostRating.findFirst({
    where: {
       postId: parseInt(postID), 
       userId: parseInt(userId) 
    },
  });
  console.log(rating)
  let rateAmount = 0;

  if (rating) {
    const upToNone = parseInt(vote) == 1 && rating.value == 1
    const downToNone = parseInt(vote) == -1 && rating.value == -1
    if(upToNone){ //same upvote
      rateAmount = -1
    }
    else if(downToNone){ //same downvote
      rateAmount = 1
    }
    else{
      rateAmount = parseInt(vote) - rating.value //upvote to downvote/vice versa
    }

    if(upToNone || downToNone){
      await prisma.blogPostRating.update({
        where: {
          id: rating.id,
        },
        data: {
          value: 0, 
        },
      });
    }
  
    else{
      await prisma.blogPostRating.update({
        where: {
          id: rating.id,
        },
        data: {
          value: parseInt(vote), 
        },
      });
    }

    await prisma.blogPost.update({
      where: { id: parseInt(postID) },
      data: {
        rating: { 
          increment: rateAmount },
      },
    });
  }
  
   else {
    
    console.log("Rating doesnt exist:", rating);
    await prisma.blogPost.update({
      where: { id: parseInt(postID) },
      data: { rating: { increment: parseInt(vote) } },
    });
    console.log(userId)

    await prisma.blogPostRating.create({
      data: {
        value: parseInt(vote), 
        userId: parseInt(userId),
        postId: parseInt(postID),
      },
    });
    
  res.status(200).json({ message: "Comment rating updated successfully" });
  return 
  }


  res.status(200).json({ message: "Comment rating updated successfully" });
  
});



export const rateComment = checkAuth(async (req, res) => {
  const userId = req.user?.userId;
  console.log(userId)
  console.log("user id is ", userId)
  const { vote, commentID } = req.body;

  const comment = await prisma.comment.findUnique({
    // select: { ratings },
    where: { id: parseInt(commentID) },
  });
 
  if (!comment) {
    return res.status(404).json({ message: "Comment does not exist" });
  }
  console.log(comment)
  console.log(commentID)
  console.log(vote)

  const rating = await prisma.commentRating.findFirst({
    where: {
      commentId: parseInt(commentID),
      userId: parseInt(userId),
    },
  });


  console.log(rating)
  let rateAmount = 0;

  if (rating) {
    const upToNone = parseInt(vote) == 1 && rating.value == 1
    const downToNone = parseInt(vote) == -1 && rating.value == -1
    if(upToNone){ //same upvote
      rateAmount = -1
    }
    else if(downToNone){ //same downvote
      rateAmount = 1
    }
    else{
      rateAmount = parseInt(vote) - rating.value //upvote to downvote/vice versa
    }

    if(upToNone || downToNone){
      await prisma.commentRating.update({
        where: {
          id: rating.id,
        },
        data: {
          value: 0, 
        },
      });
    }
  
    else{
      await prisma.commentRating.update({
        where: {
          id: rating.id,
        },
        data: {
          value: parseInt(vote), 
        },
      });
    }

    await prisma.comment.update({
      where: { id: parseInt(commentID) },
      data: {
        rating: { 
          increment: rateAmount },
      },
    });
  }
  
   else {
    
    console.log("Rating doesnt exist:", rating);
    await prisma.comment.update({
      where: { id: parseInt(commentID) },
      data: { rating: { increment: parseInt(vote) } },
    });
    console.log(userId)

    await prisma.commentRating.create({
      data: {
        value: parseInt(vote), 
        userId: parseInt(userId),
        commentId: parseInt(commentID),
      },
    });
    
  res.status(200).json({ message: "Comment rating updated successfully" });
  return 
  }


  res.status(200).json({ message: "Comment rating updated successfully" });
});
