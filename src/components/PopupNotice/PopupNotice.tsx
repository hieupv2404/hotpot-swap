import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import CloseIcon from '../CloseIcon'
import Modal from '../Modal'

const CloseIconStyle = styled(CloseIcon)`
  stroke: ${({ theme }) => theme.smText};
`

const Text = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
  padding-top: 12px;
  opacity: 0.6;
  i {
    font-weight: 700;
  }
  span {
    color: red;
  }
`
interface PopUpNoticeProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function PopupNotice({ isOpen, onDismiss }: PopUpNoticeProps) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} padding={28}>
      <div className="flex justify-end">
        <CloseIconStyle onClick={onDismiss} />
      </div>

      <div className="flex justify-center">
        <Image src={'/images/warning.svg'} width="115px" height="100px" alt="transaction rejected" />
      </div>

      <Text>
        We have updated new farming features, please support us by going to &ldquo;Ended&ldquo; tab, claim your reward
        and withdraw your LP then re-deposit to our new farms at &ldquo;Active&ldquo; tab.
        <br />
        <br />
        <i>*Please follow these two steps to claim and withdraw LP tokens </i>
        <br />
        <i> Step 1: Click Claim button to claim all your Stand rewards</i>
        <br />
        <i>
          {' '}
          Step 2: After you done step 1, Withdraw and claim button will be enabled then take all your LP tokens out of
          the farm
        </i>
        <br />
        <i> * Thank you for your corporation!</i>
        <br />
        <br />
        <i>
          <span>*Notice:</span> Ended farm will no longer provide reward and APY will drop down to 0%.
        </i>
      </Text>
    </Modal>
  )
}
