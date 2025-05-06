import styled, { createGlobalStyle } from "styled-components";

export const prefixId = "reactSchedulerOutsideWrapper";

export const GlobalStyle = createGlobalStyle`
  #${prefixId} {
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    margin: 0;

    /* Override Scheduler styles */
    .react-scheduler {
      background-color: #ffffff !important;
      
      /* Header */
      .scheduler-header {
        background-color: #ffffff !important;
        border-bottom: 1px solid #dadce0 !important;
        padding: 16px !important;
        
        .header-title {
          color: #202124 !important;
          font-size: 20px !important;
          font-weight: 500 !important;
        }
        
        .header-actions {
          button {
            background-color: #1a73e8 !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: background-color 0.2s !important;
            
            &:hover {
              background-color: #4285f4 !important;
            }
          }
        }
      }
      
      /* Resource list */
      .resource-list {
        background-color: #ffffff !important;
        border-right: 1px solid #dadce0 !important;
        
        .resource-item {
          padding: 12px 16px !important;
          border-bottom: 1px solid #dadce0 !important;
          cursor: pointer !important;
          transition: background-color 0.2s !important;
          
          &:hover {
            background-color: #f8f9fa !important;
          }
          
          &.selected {
            background-color: #e8f0fe !important;
          }
        }
      }
      
      /* Timeline */
      .timeline {
        background-color: #ffffff !important;
        
        .timeline-header {
          background-color: #ffffff !important;
          border-bottom: 1px solid #dadce0 !important;
          
          .timeline-cell {
            padding: 12px !important;
            text-align: center !important;
            color: #202124 !important;
            font-weight: 500 !important;
          }
        }
        
        .timeline-grid {
          background-color: #f1f3f4 !important;
          
          .timeline-row {
            border-bottom: 1px solid #dadce0 !important;
            
            .timeline-cell {
              border-right: 1px solid #dadce0 !important;
            }
          }
        }
      }
      
      /* Events */
      .event {
        background-color: #1a73e8 !important;
        border-radius: 4px !important;
        padding: 4px 8px !important;
        color: white !important;
        font-size: 12px !important;
        cursor: pointer !important;
        transition: transform 0.2s !important;
        
        &:hover {
          transform: scale(1.02) !important;
        }
      }

      /* Tooltip */
      .tooltip {
        background-color: #ffffff !important;
        border: 1px solid #dadce0 !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        padding: 8px !important;
        
        .tooltip-title {
          color: #202124 !important;
          font-weight: 500 !important;
        }
        
        .tooltip-content {
          color: #5f6368 !important;
        }
      }
    }
  }
`;

export const StyledSchedulerFrame = styled.div`
  position: relative; 
  top: 0;
  right: 0;
  width: calc(55vw); 
  height: 41vh; 
  display: flex;
  justify-content: center;
  align-items: center;
  background: #FFFFFF;
  overflow: hidden;
  
  margin-left: auto; 
  margin-right: auto;
`;
