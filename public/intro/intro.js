const userCookie = decodeURIComponent(document.cookie.match(/(^| )userCookie=([^;]+)/)?.[2]);
if(userCookie && userCookie!="undefined"){ 
    document.querySelector("#guestHeader").style.display = "none";
    document.querySelector("#userHeader").style.display = "block";
}


(async () => {
    const nid = new URLSearchParams(window.location.search).get('nid');
    createDetailBoard(nid);
    createBoard();
})();



// 전체 글 보기
async function createBoard(){
    // board 초기화
    document.querySelector("#boardTable tbody").innerHTML=""

    const {boardData=[]} = await fetch("/product/board", {
        method: "GET",
        headers: {"Content-Type": "application/json"},
    }).then(response => response.json())
    
    // boardData를 역순으로 정렬
    boardData.reverse();
    
    // board에 글쓰기
    let cnt = 1
    for({userName, id, title, content} of boardData){
        document.querySelector("#boardTable tbody").innerHTML += `
            <td>${cnt++}</td>
            <td onclick="window.location.href='/product?nid=${id}'">${title}</td>
            <td>${userName}</td>
            <td>${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)} ${id.slice(8, 10)}:${id.slice(10, 12)}</td>
        `;
    }
}


// 상세 글 보기기
async function createDetailBoard(nid=null){

    if(!nid){ return }

    const { boardData = [] } = await fetch("/product/board", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    }).then(response => response.json());
    
    const detailData = boardData.find(b => b.id == nid);
    if (!detailData) return;  // detailData가 없으면 함수 종료
    
    const { userName, id, title, content, comments } = detailData;
    const formattedDate = `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)} ${id.slice(8, 10)}:${id.slice(10, 12)}`;
    const commentHtml = comments.map(d => `<span class="comment">${d.userName}: ${d.comment}</span>`).join("");
    
    const isOwner = userName === userCookie;
    const deleteButton = isOwner ? `<button onclick="deleteBoard(${id})">삭제</button>` : '';
    
    document.querySelector("#boardDetail").style.display = "block";
    document.querySelector("#boardDetail").innerHTML = `
        <div id="detailTitle">
            <div id="detailTitleContainer">
                <b>${title}</b>
                <span>${userName} ${formattedDate}</span>
            </div>
            ${deleteButton}
        </div>
        <div id="detailContent">${content}</div>
        <div id="detailComment">
            <b>댓글</b>
            ${commentHtml}
            <textarea placeholder="댓긓을 입력해주세요"></textarea>
            <div><button onclick="writeComment(${id})">작성</button></div>
        </div>
    `;
}


async function deleteBoard(id){
    if(!userCookie || userCookie=="undefined"){ alert("로그인을 해주세요."); return; }

    if(confirm("삭제하시겠습니까?")){
        await fetch("/product/board", {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id })
        }).then(response => response.json())
    
        window.location.href = "/product"
    }
}


function writeBoard(){
    if(!userCookie || userCookie=="undefined"){ alert("로그인을 해주세요."); return; }

    document.querySelector("#boardModalContent input").value = "";
    document.querySelector("#boardModalContent textarea").value = "";
    document.querySelector('#simpleModal').style.display = 'block'
}


async function writeComment(id){
    if(!userCookie || userCookie=="undefined"){ alert("로그인을 해주세요."); return; }

    const comment = document.querySelector("#detailComment textarea").value;
    if(!comment){ alert("댓글을 작성해주세요"); return; }

    await fetch("/product/comment", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ id, comment })
    })

    window.location.reload()
}


async function saveBoard(){
    if(!userCookie || userCookie=="undefined"){ alert("로그인을 해주세요."); return; }

    const title = document.querySelector("#boardModalContent input").value;
    const content = document.querySelector("#boardModalContent textarea").value;

    if(!title || !content){ alert("제목과 본문을 입력해주세요"); return; }

    await fetch("/product/board", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ title, content })
    })

    // board 새로고침
    window.location.reload();
}