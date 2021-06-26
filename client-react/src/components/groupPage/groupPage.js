import React, { useEffect, useState } from 'react'
import EditGroupDescription from '../forms/editGroupDescription/editGroupDescription'
import GroupPostForm from '../forms/groupPostForm/groupPostForm'
import GroupPost from './groupPost/groupPost'
import './groupPage.css'

const GroupPage = (props) => {
  let {
    selectedGroup, groupPosts, onCleanUpGroup, loggedInUser, onJoinGroup, isLoggedIn, onLeaveGroup, onDisbandGroup,
    onUpdateGroupVotes, onAddFriend, onRemoveUser, onRemoveGroupAdmin, onMakeGroupAdmin, onTransferGroupOwner
  } = props
  let [formView, setView] = useState(false)
  let [owner, setOwner] = useState(undefined)
  let [isOwner, checkOwner] = useState(false)
  let [admins, setAdmins] = useState([])
  let [isAdmin, checkAdmin] = useState(false)
  let [isMember, setMembership] = useState(false)
  let [messageView, setMessageView] = useState(false)

  useEffect(() => {
    setOwner(selectedGroup ? selectedGroup.users.filter(user => user.membership === 'Owner')[0] : undefined)
    checkOwner((owner && loggedInUser) ? owner.id === loggedInUser.id ? true : false : false)
    setMembership(loggedInUser && selectedGroup ? selectedGroup.users.filter(user => user.id === loggedInUser.id).length === 1 ? true : false : false)
    setAdmins(selectedGroup ? selectedGroup.users.filter(user => user.membership === 'Admin') : [])
    checkAdmin(loggedInUser && admins.length > 0 ? admins.filter(user => user.id === loggedInUser.id).length >= 1 ? true : false : false)
  }, [selectedGroup, loggedInUser, owner, admins])

  useEffect(() => {
    return () => {
      onCleanUpGroup()
      setView(false)
      setOwner(undefined)
      checkOwner(false)
    }
  }, [onCleanUpGroup])

  return (
    <div>
      {selectedGroup ?
        <div>
          {/* group details */}
          <div className='container toLeft'>
            <div className='info'>
              <h1>{selectedGroup.groupName}</h1><br />
              <div>
                <h3>Owner: </h3>
                <p>{owner ? owner.userName : null}</p>
              </div><br />
            </div>

            <div className='form'>
              <div style={formView ? { display: 'none' } : { display: 'block' }}>
                <h3>Description</h3>
                <p>{selectedGroup.discription}</p>
              </div>

              <div className="group-owner-description">
                <p>Description</p>
                <div style={formView ? { display: 'none' } : { display: 'block' }}>
                  <h3>Description</h3>
                  <p>{selectedGroup.discription}</p>
                </div>
                <div style={formView && isOwner ? { display: 'block' } : { display: 'none' }}>
                  <EditGroupDescription {...props} group={selectedGroup} setView={setView} />
                </div>
                <button
                  style={isOwner ? formView ? { display: 'none' } : { display: 'block' } : { display: 'none' }}
                  onClick={() => setView(true)}
                >
                  Edit Description
               </button>

          {/* group Members */}
          <div className='container toRight usersList'>
            <h3>Group Members</h3><hr />
            <div>
              <div>
                <h4>Owner:</h4>
                {selectedGroup ? selectedGroup.users.filter(user => user.membership === 'Owner').map(user => (
                  <div key={user.id}>
                    <div>
                      <h3>{user.userName}</h3>
                      {/* <button>options</button> */}
                    </div>
                    <div>
                      <div>
                        <button
                          style={
                            loggedInUser && ((loggedInUser.id === user.id) || loggedInUser.friends.filter(friend => friend.id === user.id).length === 1) ?
                              { display: 'none' } : { display: 'inline' }
                          }
                          onClick={() => onAddFriend({ recieverId: user.id })}
                        >Add Friend</button>
                      </div>
                      <div>
                        <button
                          style={isOwner ? { display: 'inline' } : { display: 'none' }}
                          onClick={() => onRemoveUser({ userId: user.id, groupId: selectedGroup.groupId })}
                        >Remove</button>
                        <button
                          style={user.membership === 'Admin' && isOwner ? { display: 'inline' } : { display: 'none' }}
                          onClick={() => onRemoveGroupAdmin({ userId: user.id, groupId: selectedGroup.groupId })}
                        >Make Member</button>
                        <button
                          onClick={() => onTransferGroupOwner({ userId: user.id, groupId: selectedGroup.groupId })}
                          style={user.membership === 'Admin' && isOwner ? { display: 'inline' } : { display: 'none' }}
                        >Make Owner</button>
                        <button
                          onClick={() => onMakeGroupAdmin({ userId: user.id, groupId: selectedGroup.groupId })}
                          style={user.membership === 'Member' && isOwner ? { display: 'inline' } : { display: 'none' }}
                        >Make Admin</button>
                      </div>
                    </div>
                  </div>
                )) : null}
              </div>
              <hr />
              <div style={admins.length === 0 ? { display: 'none' } : { display: 'inline' }}>
                <h4>Admin</h4>
                {selectedGroup ? selectedGroup.users.filter(user => user.membership === 'Admin').map(user => (<div>
                  <div>
                    <h3>{user.userName}</h3>
                    {/* <button>options</button> */}
                  </div>
                  <div>
                    <div>
                      <button
                        style={
                          loggedInUser && ((loggedInUser.id === user.id) || loggedInUser.friends.filter(friend => friend.id === user.id).length === 1) ?
                            { display: 'none' } : { display: 'inline' }
                        }
                        onClick={() => onAddFriend({ recieverId: user.id })}
                      >Add Friend</button>
                    </div>
                    <div>
                      <button
                        style={isOwner ? { display: 'inline' } : { display: 'none' }}
                        onClick={() => onRemoveUser({ userId: user.id, groupId: selectedGroup.groupId })}
                      >Remove</button>
                      <button
                        style={user.membership === 'Admin' && isOwner ? { display: 'inline' } : { display: 'none' }}
                        onClick={() => onRemoveGroupAdmin({ userId: user.id, groupId: selectedGroup.groupId })}
                      >Make Member</button>
                      <button
                        onClick={() => onTransferGroupOwner({ userId: user.id, groupId: selectedGroup.groupId })}
                        style={user.membership === 'Admin' && isOwner ? { display: 'inline' } : { display: 'none' }}
                      >Make Owner</button>
                      <button
                        onClick={() => onMakeGroupAdmin({ userId: user.id, groupId: selectedGroup.groupId })}
                        style={user.membership === 'Member' && isOwner ? { display: 'inline' } : { display: 'none' }}
                      >Make Admin</button>
                    </div>
                  </div>
                </div>
                )) : null}
              </div>
              <hr />
              <div>
                <h4>Member:</h4>
                {selectedGroup ? selectedGroup.users.filter(user => user.membership === 'Member').map(user => (<div>
                  <div>
                    <h3>{user.userName}</h3>
                    {/* <button>options</button> */}
                  </div>
                  <div>
                    <div>
                      <button
                        style={
                          loggedInUser && ((loggedInUser.id === user.id) || loggedInUser.friends.filter(friend => friend.id === user.id).length === 1) ?
                            { display: 'none' } : { display: 'inline' }
                        }
                        onClick={() => onAddFriend({ recieverId: user.id })}
                      >Add Friend</button>
                    </div>
                    <div>
                      <button
                        style={isOwner || isAdmin ? { display: 'inline' } : { display: 'none' }}
                        onClick={() => onRemoveUser({ userId: user.id, groupId: selectedGroup.groupId })}
                      >Remove</button>
                      <button
                        style={user.membership === 'Admin' && isOwner ? { display: 'inline' } : { display: 'none' }}
                        onClick={() => onRemoveGroupAdmin({ userId: user.id, groupId: selectedGroup.groupId })}
                      >Make Member</button>
                      <button
                        onClick={() => onTransferGroupOwner({ userId: user.id, groupId: selectedGroup.groupId })}
                        style={user.membership === 'Admin' && isOwner ? { display: 'inline' } : { display: 'none' }}
                      >Make Owner</button>
                      <button
                        onClick={() => onMakeGroupAdmin({ userId: user.id, groupId: selectedGroup.groupId })}
                        style={user.membership === 'Member' && isOwner ? { display: 'inline' } : { display: 'none' }}
                      >Make Admin</button>
                    </div>
                  </div>
                </div>
                )) : null}
              </div>
              <hr />
            </div>


          {/* group posts */}
          <div className='container toLeft'>
            <button onClick={() => setMessageView(false)}>
              <h3>Posts</h3>
            </button>
            <button style={isMember ? { display: 'inline' } : { display: 'none' }} onClick={() => setMessageView(true)}>
              <h3>Group Messages</h3>
            </button>
            <div style={!messageView ? { display: 'block' } : { display: 'none' }}>
              <div style={isMember ? { display: 'block' } : { display: 'none' }}>
                <GroupPostForm {...props} group={selectedGroup} isAdmin={isAdmin} isOwner={isOwner} />
              </div>
              {groupPosts.length === 0 ? <span>No Posts Have Been Made Yet</span> : groupPosts.filter(post => post.isHidden === 0).map(post => (
                <GroupPost key={post.id} {...props} post={post} isOwner={isOwner} />
              ))}
            </div>
          </div>

            <div style={messageView ? { display: 'block' } : { display: 'none' }}><div style={isMember ? { display: 'block' } : { display: 'none' }}>
              <GroupPostForm {...props} group={selectedGroup} isAdmin={isAdmin} isOwner={isOwner} />
            </div>
              {groupPosts.length === 0 ? <span>No Posts Have Been Made Yet</span> : groupPosts.filter(post => post.isHidden === 1).map(post => (
                <GroupPost key={post.id} {...props} post={post} isOwner={isOwner} />
              ))}
            </div>
          </div>
        </div>

        : <span>Loading Page...</span>}
    </div>
  )
}

export default GroupPage