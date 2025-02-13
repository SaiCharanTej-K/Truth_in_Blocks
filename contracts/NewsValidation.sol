// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NewsValidation {
    struct News {
        uint256 id;
        address author;
        string title;
        string content;
        uint256 trueVotes;
        uint256 falseVotes;
        bool isValidated;
        mapping(address => bool) hasVoted;
    }

    uint256 private newsCount;
    mapping(uint256 => News) public newsItems;
    
    event NewsSubmitted(uint256 indexed id, address indexed author, string title);
    event VoteSubmitted(uint256 indexed newsId, address indexed voter, bool isTrue);
    event NewsValidated(uint256 indexed newsId, bool isTrue);

    error InvalidNewsId();
    error AlreadyVoted();
    error NewsAlreadyValidated();
    error AuthorCannotVote();
    error UnauthorizedAccess();

    modifier validNewsId(uint256 _newsId) {
        if (_newsId == 0 || _newsId > newsCount) revert InvalidNewsId();
        _;
    }

    modifier notVoted(uint256 _newsId) {
        if (newsItems[_newsId].hasVoted[msg.sender]) revert AlreadyVoted();
        _;
    }

    modifier notValidated(uint256 _newsId) {
        if (newsItems[_newsId].isValidated) revert NewsAlreadyValidated();
        _;
    }

    modifier notAuthor(uint256 _newsId) {
        if (msg.sender == newsItems[_newsId].author) revert AuthorCannotVote();
        _;
    }

    function submitNews(string memory _title, string memory _content) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_content).length > 0, "Content cannot be empty");
        
        newsCount++;
        News storage newNews = newsItems[newsCount];
        newNews.id = newsCount;
        newNews.author = msg.sender;
        newNews.title = _title;
        newNews.content = _content;
        newNews.trueVotes = 0;
        newNews.falseVotes = 0;
        newNews.isValidated = false;

        emit NewsSubmitted(newsCount, msg.sender, _title);
    }

    function voteOnNews(uint256 _newsId, bool _isTrue) 
        public 
        validNewsId(_newsId)
        notVoted(_newsId)
        notValidated(_newsId)
        notAuthor(_newsId)
    {
        News storage news = newsItems[_newsId];
        news.hasVoted[msg.sender] = true;

        if (_isTrue) {
            news.trueVotes++;
        } else {
            news.falseVotes++;
        }

        emit VoteSubmitted(_newsId, msg.sender, _isTrue);

        if (news.trueVotes + news.falseVotes >= 3) {
            news.isValidated = true;
            emit NewsValidated(_newsId, news.trueVotes > news.falseVotes);
        }

    }

    function getNews(uint256 _newsId) public view returns (
        uint256 id,
        address author,
        string memory title,
        string memory content,
        uint256 trueVotes,
        uint256 falseVotes,
        bool isValidated
    ) {
        if (_newsId == 0 || _newsId > newsCount) revert InvalidNewsId();
        News storage news = newsItems[_newsId];
        return (
            news.id,
            news.author,
            news.title,
            news.content,
            news.trueVotes,
            news.falseVotes,
            news.isValidated
        );
    }

    function getNewsCount() public view returns (uint256) {
        return newsCount;
    }

    function hasVoted(uint256 _newsId, address _voter) public view returns (bool) {
        if (_newsId == 0 || _newsId > newsCount) revert InvalidNewsId();
        return newsItems[_newsId].hasVoted[_voter];
    }
}
